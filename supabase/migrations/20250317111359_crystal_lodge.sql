/*
  # Add User Roles and Privileges

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `role_id` (uuid, references roles)
      - `created_at` (timestamp)

  2. Changes
    - Add role-based access control
    - Add default roles (user, admin)
    - Add function to check user roles
    - Add trigger to assign default role on user creation

  3. Security
    - Enable RLS on new tables
    - Add policies for role-based access
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('user', 'Regular user with basic privileges'),
  ('admin', 'Administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS TABLE (role_name text) AS $$
BEGIN
  RETURN QUERY
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  -- Get default role id
  SELECT id INTO default_role_id
  FROM roles
  WHERE name = 'user';
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (new.id, default_role_id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for roles table
CREATE POLICY "Admins can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (has_role('admin'));

CREATE POLICY "Admins can insert roles"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role('admin'));

CREATE POLICY "Admins can update roles"
  ON roles
  FOR UPDATE
  TO authenticated
  USING (has_role('admin'));

-- Policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role('admin'));

CREATE POLICY "Admins can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (has_role('admin'));

-- Update profiles policies to include admin access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR has_role('admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR has_role('admin'));