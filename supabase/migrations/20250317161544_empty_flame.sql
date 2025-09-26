/*
  # Fix Admin Activity Logging
  
  1. Changes
    - Update log_admin_activity function to handle auth.uid() properly
    - Add trigger to update admin_activities
  
  2. Security
    - Maintain RLS policies
    - Add proper error handling
*/

-- Drop existing function
DROP FUNCTION IF EXISTS log_admin_activity;

-- Create improved function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the user's profile ID
  SELECT id INTO v_user_id
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Insert activity record
  INSERT INTO admin_activities (
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  ) VALUES (
    v_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_details,
    now()
  );

  -- Log the activity
  RAISE NOTICE 'Admin activity logged: % % by %', p_action, p_entity_type, v_user_id;
END;
$$;