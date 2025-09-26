/*
  # Add Track Newsletter Email Function
  
  1. Changes
    - Create function to track newsletter email sends
    - Update last_email_sent timestamp
    - Log email activity
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Create function to track newsletter email sends
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
  v_user_id uuid;
BEGIN
  -- Update last_email_sent timestamp
  UPDATE newsletter_subscribers
  SET last_email_sent = now()
  WHERE email = p_email;
  
  -- Get current user ID if authenticated
  SELECT auth.uid() INTO v_user_id;
  
  -- Log the email activity if user is authenticated
  IF v_user_id IS NOT NULL THEN
    INSERT INTO admin_activities (
      user_id,
      action,
      entity_type,
      details
    ) VALUES (
      v_user_id,
      'sent_email',
      'newsletter_subscriber',
      jsonb_build_object(
        'email', p_email,
        'email_type', p_email_type,
        'sent_at', now()
      )
    );
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error in track_newsletter_email: %', SQLERRM;
    RETURN false;
END;
$$;