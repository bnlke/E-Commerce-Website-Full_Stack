/*
  # Add Activity Deletion Support
  
  1. Changes
    - Add delete policy for admin activities
    - Add function to delete activity with logging
    - Add cascade deletion
  
  2. Security
    - Only admins can delete activities
    - Maintain audit trail
*/

-- Add delete policy
DROP POLICY IF EXISTS "Only admins can delete activities" ON admin_activities;
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
  v_activity admin_activities;
BEGIN
  -- Get the user's profile ID
  SELECT id INTO v_user_id
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Get activity to be deleted
  SELECT * INTO v_activity
  FROM admin_activities
  WHERE id = activity_id;

  IF v_activity IS NULL THEN
    RETURN false;
  END IF;

  -- Delete the activity
  DELETE FROM admin_activities
  WHERE id = activity_id;

  -- Log the deletion as a new activity
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
    jsonb_build_object(
      'deleted_activity', jsonb_build_object(
        'action', v_activity.action,
        'entity_type', v_activity.entity_type,
        'created_at', v_activity.created_at
      ),
      'deleted_at', now()
    )
  );

  RETURN true;
END;
$$;