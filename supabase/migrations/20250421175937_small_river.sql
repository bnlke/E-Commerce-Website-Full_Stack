/*
  # Add Newsletter Email Notification Support
  
  1. Changes
    - Update subscribe_to_newsletter function to trigger email notification
    - Add function to track email notifications
    - Add column for tracking last email sent
  
  2. Security
    - Maintain existing RLS policies
    - Use explicit schema references
*/

-- Add last_email_sent column to newsletter_subscribers
ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS last_email_sent timestamptz;

-- Create function to track email notifications
CREATE OR REPLACE FUNCTION track_newsletter_email(
  p_email text,
  p_email_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update last_email_sent timestamp
  UPDATE newsletter_subscribers
  SET last_email_sent = now()
  WHERE email = p_email;
  
  -- Log the email notification
  INSERT INTO admin_activities (
    user_id,
    action,
    entity_type,
    details
  ) VALUES (
    (SELECT id FROM profiles WHERE id = auth.uid()),
    'sent_email',
    'newsletter_subscriber',
    jsonb_build_object(
      'email', p_email,
      'email_type', p_email_type,
      'sent_at', now()
    )
  );
  
  RETURN FOUND;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;

-- Update subscribe_to_newsletter function to include email notification
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
  IF NOT v_already_subscribed THEN
    PERFORM track_newsletter_email(p_email, 'welcome');
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;