/*
  # Add Default Payment Support for Checkout
  
  1. Changes
    - Add function to get default payment method for a user
    - Add function to get payment method details
    - Add view for user payment methods
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Function to get default payment method for a user
CREATE OR REPLACE FUNCTION get_default_payment_method(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id uuid;
BEGIN
  -- Get default payment method ID
  SELECT id INTO v_payment_id
  FROM payment_methods
  WHERE user_id = p_user_id
  AND is_default = true
  LIMIT 1;
  
  -- If no default, get the most recent one
  IF v_payment_id IS NULL THEN
    SELECT id INTO v_payment_id
    FROM payment_methods
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN v_payment_id;
END;
$$;

-- Function to get payment method details
CREATE OR REPLACE FUNCTION get_payment_method_details(p_payment_id uuid)
RETURNS TABLE (
  id uuid,
  card_type text,
  last_four text,
  expiry_date text,
  cardholder_name text,
  is_default boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.card_type,
    pm.last_four,
    pm.expiry_date,
    pm.cardholder_name,
    pm.is_default
  FROM payment_methods pm
  WHERE pm.id = p_payment_id
  AND pm.user_id = auth.uid();
END;
$$;

-- Create view for user payment methods
CREATE OR REPLACE VIEW user_payment_methods
WITH (security_barrier = true)
AS
  SELECT 
    pm.id,
    pm.card_type,
    pm.last_four,
    pm.expiry_date,
    pm.cardholder_name,
    pm.is_default,
    pm.created_at,
    pm.updated_at
  FROM payment_methods pm
  WHERE pm.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_payment_methods TO authenticated;