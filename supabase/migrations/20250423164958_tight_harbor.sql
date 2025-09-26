-- Function to get order by payment intent ID
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
BEGIN
  -- First get the order ID from stripe_orders
  SELECT o.id INTO v_order_id
  FROM orders o
  JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id
  WHERE so.customer_id IN (
    SELECT customer_id
    FROM stripe_customers
    WHERE user_id = auth.uid()
  )
  LIMIT 1;
  
  -- If not found, try to get from orders table directly
  IF v_order_id IS NULL THEN
    SELECT id INTO v_order_id
    FROM orders
    WHERE payment_method = 'Stripe'
    AND user_id = auth.uid()
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- Return order details
  RETURN QUERY
  SELECT * FROM get_order_by_id(v_order_id);
END;
$$;

-- Function to ensure order is created only once per payment intent
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
END;
$$;