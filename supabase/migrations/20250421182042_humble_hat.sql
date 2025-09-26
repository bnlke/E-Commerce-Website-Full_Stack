/*
  # Add Track Newsletter Email Function
  
  1. New Functions
    - `track_newsletter_email` - Tracks when emails are sent to subscribers
    - `check_subscription_status` - Checks if an email is subscribed
  
  2. Changes
    - Add last_email_sent column to newsletter_subscribers table
    - Add functions to track and check email status
  
  3. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Add last_email_sent column to newsletter_subscribers table
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS last_email_sent timestamptz;

-- Create function to track newsletter emails
CREATE OR REPLACE FUNCTION track_newsletter_email(
  p_email text,
  p_email_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscriber_id uuid;
BEGIN
  -- Get subscriber ID
  SELECT id INTO v_subscriber_id
  FROM newsletter_subscribers
  WHERE email = p_email AND status = 'active';

  IF v_subscriber_id IS NULL THEN
    RAISE NOTICE 'Subscriber not found or not active: %', p_email;
    RETURN false;
  END IF;

  -- Update last_email_sent timestamp
  UPDATE newsletter_subscribers
  SET last_email_sent = now()
  WHERE id = v_subscriber_id;

  -- Log the email
  INSERT INTO admin_activities (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    (SELECT id FROM profiles LIMIT 1), -- Use first profile as system user
    'sent_email',
    'newsletter_subscriber',
    v_subscriber_id,
    jsonb_build_object(
      'email', p_email,
      'email_type', p_email_type,
      'sent_at', now()
    )
  );

  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error tracking newsletter email: %', SQLERRM;
    RETURN false;
END;
$$;

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