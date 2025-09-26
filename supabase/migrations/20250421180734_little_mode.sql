/*
  # Add Check Subscription Function
  
  1. New Functions
    - `check_subscription_status`: Checks if an email is already subscribed
    - Returns subscription status and timestamp
  
  2. Security
    - Function is accessible to public
    - Maintains existing RLS policies
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
    status = 'active' as is_subscribed,
    created_at as subscription_date
  FROM newsletter_subscribers
  WHERE email = p_email;
  
  -- If no row found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::timestamptz;
  END IF;
END;
$$;