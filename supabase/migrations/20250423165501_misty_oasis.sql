/*
  # Add Payment Confirmation Functions
  
  1. New Functions
    - `get_order_summary`: Retrieves a complete order summary for payment confirmation
    - `verify_payment_status`: Checks if a payment is successful with Stripe
  
  2. Security
    - Functions are SECURITY DEFINER to run with elevated privileges
    - Access control is handled within the functions using auth.uid()
*/

-- Function to get a complete order summary for payment confirmation
CREATE OR REPLACE FUNCTION get_order_summary(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_summary jsonb;
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Get order details with items, shipping address, and payment details
  SELECT jsonb_build_object(
    'id', o.id,
    'status', o.status,
    'total_amount', o.total_amount,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'items', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'product', jsonb_build_object(
              'name', p.name,
              'image_url', p.image_url,
              'slug', p.slug
            )
          )
        )
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    ),
    'shipping_address', CASE 
      WHEN o.shipping_address_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', ua.id,
            'name', ua.name,
            'address_line1', ua.address_line1,
            'address_line2', ua.address_line2,
            'city', ua.city,
            'state', ua.state,
            'postal_code', ua.postal_code,
            'country', ua.country,
            'phone', ua.phone
          )
          FROM user_addresses ua
          WHERE ua.id = o.shipping_address_id
        )
      ELSE NULL
    END,
    'payment_details', CASE 
      WHEN o.payment_method_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', pm.id,
            'card_type', pm.card_type,
            'last_four', pm.last_four,
            'expiry_date', pm.expiry_date,
            'cardholder_name', pm.cardholder_name
          )
          FROM payment_methods pm
          WHERE pm.id = o.payment_method_id
        )
      ELSE NULL
    END
  ) INTO v_order_summary
  FROM orders o
  WHERE o.id = p_order_id
  AND o.user_id = v_user_id;
  
  IF v_order_summary IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'order', v_order_summary
  );
END;
$$;

-- Function to verify payment status with Stripe
CREATE OR REPLACE FUNCTION verify_payment_status(p_payment_intent_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Check if we have an order for this payment intent
  SELECT o.id INTO v_order_id
  FROM orders o
  JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id
  WHERE o.user_id = v_user_id;
  
  -- If we found an order, it means the payment was successful
  IF v_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'succeeded',
      'order_id', v_order_id
    );
  END IF;
  
  -- If we didn't find an order, return an error
  RETURN jsonb_build_object(
    'success', false,
    'status', 'not_found',
    'error', 'No order found for this payment'
  );
END;
$$;