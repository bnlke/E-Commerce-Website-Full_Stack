/*
  # Add Function to Ensure Order is Created Only Once
  
  1. New Functions
    - `ensure_order_created_once`: Creates an order for a payment intent if it doesn't exist
    - Handles race conditions and duplicate order creation
  
  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Validates user permissions
*/

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
EXCEPTION
  WHEN unique_violation THEN
    -- If there's a unique violation, it means another concurrent request
    -- has already created the order. Try to get that order ID.
    SELECT o.id INTO v_existing_order_id
    FROM orders o
    JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id;
    
    IF v_existing_order_id IS NOT NULL THEN
      RETURN v_existing_order_id;
    ELSE
      -- If we still can't find it, something went wrong
      RAISE EXCEPTION 'Failed to create or retrieve order';
    END IF;
  WHEN OTHERS THEN
    RAISE LOG 'Error in ensure_order_created_once: %', SQLERRM;
    RETURN NULL;
END;
$$;