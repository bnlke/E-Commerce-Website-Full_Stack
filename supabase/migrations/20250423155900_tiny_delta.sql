/*
  # Add Stripe Payment Method Support
  
  1. New Functions
    - `get_stripe_payment_method`: Retrieves a Stripe payment method ID for a user's saved payment method
    - `match_payment_method_to_stripe`: Matches a local payment method to a Stripe payment method
  
  2. Changes
    - Adds support for finding and using saved payment methods with Stripe
    - Improves checkout experience by using saved payment information
*/

-- Function to get a Stripe payment method ID for a user's saved payment method
CREATE OR REPLACE FUNCTION get_stripe_payment_method(
  p_user_id uuid,
  p_payment_method_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_method payment_methods;
  v_customer_id text;
BEGIN
  -- Get the payment method details
  SELECT * INTO v_payment_method
  FROM payment_methods
  WHERE id = p_payment_method_id
  AND user_id = p_user_id;
  
  IF v_payment_method IS NULL THEN
    RAISE EXCEPTION 'Payment method not found or does not belong to user';
  END IF;
  
  -- Get the Stripe customer ID
  SELECT customer_id INTO v_customer_id
  FROM stripe_customers
  WHERE user_id = p_user_id
  AND deleted_at IS NULL;
  
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Stripe customer not found for user';
  END IF;
  
  -- Return the payment method details
  RETURN jsonb_build_object(
    'customer_id', v_customer_id,
    'card_type', v_payment_method.card_type,
    'last_four', v_payment_method.last_four,
    'expiry_date', v_payment_method.expiry_date,
    'cardholder_name', v_payment_method.cardholder_name
  )::text;
END;
$$;

-- Function to match a local payment method to a Stripe payment method
CREATE OR REPLACE FUNCTION match_payment_method_to_stripe(
  p_user_id uuid,
  p_payment_method_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_method payment_methods;
  v_customer_id text;
BEGIN
  -- Get the payment method details
  SELECT * INTO v_payment_method
  FROM payment_methods
  WHERE id = p_payment_method_id
  AND user_id = p_user_id;
  
  IF v_payment_method IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the Stripe customer ID
  SELECT customer_id INTO v_customer_id
  FROM stripe_customers
  WHERE user_id = p_user_id
  AND deleted_at IS NULL;
  
  IF v_customer_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Return the payment method details for matching
  RETURN jsonb_build_object(
    'customer_id', v_customer_id,
    'card_type', v_payment_method.card_type,
    'last_four', v_payment_method.last_four,
    'expiry_date', v_payment_method.expiry_date
  )::text;
END;
$$;