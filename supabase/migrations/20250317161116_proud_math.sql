/*
  # Add Activity Tracking
  
  1. New Tables
    - `admin_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add admin-only policies
*/

-- Create admin activities table
CREATE TABLE admin_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
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