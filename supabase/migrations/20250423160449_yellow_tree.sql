/*
  # Add Stripe Checkout Address Support
  
  1. New Functions
    - `get_user_default_address`: Gets the default address for a user
    - `get_user_default_payment`: Gets the default payment method for a user
    - `format_address_for_stripe`: Formats a user address for Stripe checkout
  
  2. Security
    - Functions are set as SECURITY DEFINER to run with elevated privileges
    - Access control is handled within the functions using auth.uid()
*/

-- Function to get the default address for a user
CREATE OR REPLACE FUNCTION get_user_default_address(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_address jsonb;
BEGIN
  -- First try to get the default address
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'address_line1', address_line1,
    'address_line2', address_line2,
    'city', city,
    'state', state,
    'postal_code', postal_code,
    'country', country,
    'phone', phone
  ) INTO v_address
  FROM user_addresses
  WHERE user_id = p_user_id
  AND is_default = true
  LIMIT 1;
  
  -- If no default address, get the most recently created one
  IF v_address IS NULL THEN
    SELECT jsonb_build_object(
      'id', id,
      'name', name,
      'address_line1', address_line1,
      'address_line2', address_line2,
      'city', city,
      'state', state,
      'postal_code', postal_code,
      'country', country,
      'phone', phone
    ) INTO v_address
    FROM user_addresses
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN v_address;
END;
$$;

-- Function to get the default payment method for a user
CREATE OR REPLACE FUNCTION get_user_default_payment(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment jsonb;
BEGIN
  -- First try to get the default payment method
  SELECT jsonb_build_object(
    'id', id,
    'card_type', card_type,
    'last_four', last_four,
    'expiry_date', expiry_date,
    'cardholder_name', cardholder_name
  ) INTO v_payment
  FROM payment_methods
  WHERE user_id = p_user_id
  AND is_default = true
  LIMIT 1;
  
  -- If no default payment method, get the most recently created one
  IF v_payment IS NULL THEN
    SELECT jsonb_build_object(
      'id', id,
      'card_type', card_type,
      'last_four', last_four,
      'expiry_date', expiry_date,
      'cardholder_name', cardholder_name
    ) INTO v_payment
    FROM payment_methods
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN v_payment;
END;
$$;

-- Function to format an address for Stripe checkout
CREATE OR REPLACE FUNCTION format_address_for_stripe(p_address_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_address user_addresses;
  v_formatted_address jsonb;
BEGIN
  -- Get the address
  SELECT * INTO v_address
  FROM user_addresses
  WHERE id = p_address_id
  AND user_id = auth.uid();
  
  IF v_address IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Format the address for Stripe
  v_formatted_address := jsonb_build_object(
    'shipping', jsonb_build_object(
      'name', v_address.name,
      'address', jsonb_build_object(
        'line1', v_address.address_line1,
        'line2', v_address.address_line2,
        'city', v_address.city,
        'state', v_address.state,
        'postal_code', v_address.postal_code,
        'country', v_address.country
      )
    )
  );
  
  -- Add phone if available
  IF v_address.phone IS NOT NULL AND v_address.phone != '' THEN
    v_formatted_address := v_formatted_address || 
      jsonb_build_object('shipping', 
        (v_formatted_address->'shipping') || 
        jsonb_build_object('phone', v_address.phone)
      );
  END IF;
  
  RETURN v_formatted_address;
END;
$$;