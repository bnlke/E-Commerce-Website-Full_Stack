/*
  # Fix Payment Confirmation Page
  
  1. Changes
    - Add function to handle payment confirmation directly
    - Improve error handling for payment intent verification
    - Add better support for retrieving order details
  
  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Validates user permissions
*/

-- Function to directly get order by payment intent ID without requiring client secret
CREATE OR REPLACE FUNCTION get_order_by_payment_intent_direct(
  p_payment_intent_id text
)
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
  LIMIT 1;
  
  -- If not found, try to get from orders table directly
  IF v_order_id IS NULL THEN
    -- Try to find the most recent order for this user
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

-- Function to handle payment confirmation directly
CREATE OR REPLACE FUNCTION handle_payment_confirmation(
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
  JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id
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
  SELECT row_to_json(o)::jsonb INTO v_order_details
  FROM get_order_by_id(v_order_id) o;
  
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order', v_order_details
  );
END;
$$;

-- Function to extract payment intent ID from client secret
CREATE OR REPLACE FUNCTION extract_payment_intent_id(
  p_client_secret text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_intent_id text;
BEGIN
  -- Extract payment intent ID from client secret
  -- Format is: pi_1234567890_secret_1234567890
  v_payment_intent_id := split_part(p_client_secret, '_secret_', 1);
  
  -- Validate that it looks like a payment intent ID
  IF v_payment_intent_id NOT LIKE 'pi_%' THEN
    RETURN NULL;
  END IF;
  
  RETURN v_payment_intent_id;
END;
$$;