/*
  # Fix Admin Activities Table and Relationships
  
  1. Changes
    - Drop and recreate admin_activities table with correct relationships
    - Update foreign key to reference profiles table
    - Add indexes for better performance
    - Fix activity logging function
  
  2. Security
    - Maintain RLS policies
    - Add proper error handling
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS admin_activities CASCADE;
DROP FUNCTION IF EXISTS log_admin_activity CASCADE;

-- Create admin activities table
CREATE TABLE admin_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_admin_activities_user_id ON admin_activities(user_id);
CREATE INDEX idx_admin_activities_created_at ON admin_activities(created_at);

-- Enable RLS
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can view activities"
  ON admin_activities
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create function to log admin activity
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't stop execution
    RAISE WARNING 'Failed to log admin activity: %', SQLERRM;
END;
$$;