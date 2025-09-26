/*
  # Fix Check Subscription Status Function
  
  1. Changes
    - Create check_subscription_status function
    - Return subscription status and date
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Create function to check subscription status
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