/*
  # Fix Subscription Status Check
  
  1. Changes
    - Update check_subscription_status function to properly handle missing subscribers
    - Improve subscribe_to_newsletter function to check status before subscribing
    - Add better error handling and logging
  
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

-- Update subscribe_to_newsletter function to check status first
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_already_subscribed boolean;
BEGIN
  -- Check if already subscribed
  SELECT EXISTS (
    SELECT 1 FROM newsletter_subscribers
    WHERE email = p_email AND status = 'active'
  ) INTO v_already_subscribed;

  -- If already subscribed, just return true without updating
  IF v_already_subscribed THEN
    RETURN true;
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
  
  -- Track email notification (only for new subscribers or resubscribes)
  PERFORM track_newsletter_email(p_email, 'welcome');
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in subscribe_to_newsletter: %', SQLERRM;
    RETURN false;
END;
$$;