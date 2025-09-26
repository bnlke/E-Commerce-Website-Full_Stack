/*
  # Add Activity Deletion Support
  
  1. Changes
    - Add delete policy for admin activities
    - Add function to delete activity with logging
  
  2. Security
    - Only admins can delete activities
    - Maintain audit trail
*/

-- Add delete policy
CREATE POLICY "Only admins can delete activities"
  ON admin_activities
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create function to delete activity
CREATE OR REPLACE FUNCTION delete_admin_activity(activity_id uuid)
RETURNS boolean
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

  -- Log the deletion
  INSERT INTO admin_activities (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    v_user_id,
    'deleted',
    'admin_activity',
    activity_id,
    jsonb_build_object('deleted_at', now())
  );

  -- Delete the activity
  DELETE FROM admin_activities
  WHERE id = activity_id;

  RETURN FOUND;
END;
$$;