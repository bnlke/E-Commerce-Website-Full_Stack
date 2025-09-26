/*
  # Fix Newsletter Subscription System
  
  1. Changes
    - Update subscribe_to_newsletter function to properly handle existing subscribers
    - Add better error handling and return values
    - Improve check_subscription_status function
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Improve check_subscription_status function
CREATE OR REPLACE FUNCTION check_subscription_status(p_email text)
RETURNS TABLE (
  is_subscribed boolean,
  subscription_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(status = 'active', false) as is_subscribed,
    created_at as subscription_date
  FROM newsletter_subscribers
  WHERE email = p_email;
  
  -- If no row found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::timestamptz;
  END IF;
END;
$$;

-- First drop the existing function to change its return type
DROP FUNCTION IF EXISTS subscribe_to_newsletter(text);

-- Recreate subscribe_to_newsletter function with jsonb return type
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_subscribed boolean;
  v_result jsonb;
BEGIN
  -- Check if already subscribed
  SELECT EXISTS (
    SELECT 1 FROM newsletter_subscribers
    WHERE email = p_email AND status = 'active'
  ) INTO v_already_subscribed;

  -- If already subscribed, return with already_subscribed flag
  IF v_already_subscribed THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_subscribed', true,
      'message', 'Email is already subscribed'
    );
  END IF;

  -- Insert new subscriber or update existing one
  INSERT INTO newsletter_subscribers (email, status)
  VALUES (p_email, 'active')
  ON CONFLICT (email) 
  DO UPDATE SET 
    status = 'active',
    created_at = CASE
      WHEN newsletter_subscribers.status = 'unsubscribed' THEN now()
      ELSE newsletter_subscribers.created_at
    END;
  
  RETURN jsonb_build_object(
    'success', true,
    'already_subscribed', false,
    'message', 'Successfully subscribed'
  );
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;