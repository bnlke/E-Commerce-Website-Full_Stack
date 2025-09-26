/*
  # Fix Payment Confirmation Process
  
  1. Changes
    - Add function to get order details by payment intent ID
    - Improve order creation from payment intent
    - Add better error handling for payment processing
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Function to get order by payment intent ID with better error handling
CREATE OR REPLACE FUNCTION get_order_by_payment_intent(p_payment_intent_id text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
  payment_method_id uuid,
  payment_details jsonb,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb
)
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
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- First try to get the order ID from stripe_orders
  SELECT o.id INTO v_order_id
  FROM orders o
  JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id
  WHERE so.customer_id IN (
    SELECT customer_id
    FROM stripe_customers
    WHERE user_id = v_user_id
  )
  LIMIT 1;
  
  -- If not found, try to get from orders table directly
  IF v_order_id IS NULL THEN
    SELECT id INTO v_order_id
    FROM orders
    WHERE payment_method = 'Stripe'
    AND user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- If still not found, return empty result
  IF v_order_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return order details
  RETURN QUERY
  SELECT * FROM get_order_by_id(v_order_id);
END;
$$;

-- Function to ensure order is created only once per payment intent with better error handling
CREATE OR REPLACE FUNCTION ensure_order_created_once(
  p_payment_intent_id text,
  p_user_id uuid,
  p_total_amount numeric,
  p_shipping_address_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_existing_order_id uuid;
  v_customer_id text;
BEGIN
  -- Check if order already exists for this payment intent
  SELECT o.id INTO v_existing_order_id
  FROM orders o
  JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id;
  
  IF v_existing_order_id IS NOT NULL THEN
    RETURN v_existing_order_id;
  END IF;
  
  -- Get customer ID for this user
  SELECT customer_id INTO v_customer_id
  FROM stripe_customers
  WHERE user_id = p_user_id
  AND deleted_at IS NULL
  LIMIT 1;
  
  -- Create new order
  INSERT INTO orders (
    user_id,
    status,
    total_amount,
    payment_method,
    shipping_address_id
  ) VALUES (
    p_user_id,
    'completed',
    p_total_amount,
    'Stripe',
    p_shipping_address_id
  )
  RETURNING id INTO v_order_id;
  
  -- Create stripe_orders record if customer ID exists
  IF v_customer_id IS NOT NULL THEN
    INSERT INTO stripe_orders (
      checkout_session_id,
      payment_intent_id,
      customer_id,
      amount_subtotal,
      amount_total,
      currency,
      payment_status,
      status
    ) VALUES (
      'direct_payment',
      p_payment_intent_id,
      v_customer_id,
      p_total_amount * 100, -- Convert to cents
      p_total_amount * 100, -- Convert to cents
      'usd',
      'paid',
      'completed'
    );
  END IF;
  
  RETURN v_order_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in ensure_order_created_once: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Function to get order details with better error handling
CREATE OR REPLACE FUNCTION get_payment_confirmation_details(
  p_payment_intent_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_user_id uuid;
  v_order_details jsonb;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Try to get the order ID
  SELECT o.id INTO v_order_id
  FROM orders o
  WHERE o.user_id = v_user_id
  AND EXISTS (
    SELECT 1 FROM stripe_orders so 
    WHERE so.payment_intent_id = p_payment_intent_id
  )
  ORDER BY o.created_at DESC
  LIMIT 1;
  
  -- If not found, try to get the most recent order
  IF v_order_id IS NULL THEN
    SELECT id INTO v_order_id
    FROM orders
    WHERE payment_method = 'Stripe'
    AND user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- If still not found, return error
  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;
  
  -- Get order details
  SELECT jsonb_build_object(
    'id', o.id,
    'status', o.status,
    'total_amount', o.total_amount,
    'created_at', o.created_at,
    'items_count', (SELECT COUNT(*) FROM order_items WHERE order_id = o.id)
  ) INTO v_order_details
  FROM orders o
  WHERE o.id = v_order_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'order', v_order_details
  );
END;
$$;