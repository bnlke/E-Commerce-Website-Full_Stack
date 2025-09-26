/*
  # Fix Admin Activities Table
  
  1. Changes
    - Drop and recreate admin_activities table
    - Update foreign key to reference profiles instead of auth.users
    - Add RLS policies
    - Add activity logging function
  
  2. Security
    - Enable RLS
    - Add admin-only policies
*/

-- Drop existing table and related objects
DROP TABLE IF EXISTS admin_activities CASCADE;
DROP FUNCTION IF EXISTS log_admin_activity CASCADE;

-- Create admin activities table
CREATE TABLE admin_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT admin_activities_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id)
);

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
AS $$
BEGIN
  INSERT INTO admin_activities (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_details
  );
END;
$$;