/*
  # Fix Subscribe to Newsletter Function
  
  1. Changes
    - Drop existing function
    - Recreate with better error handling
    - Return detailed status information
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Drop existing function
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