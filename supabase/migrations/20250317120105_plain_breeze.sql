/*
  # Update User Policies

  1. Changes
    - Update profiles table policies to restrict access to admins only
    - Add policies for user management
    - Improve role-based access control

  2. Security
    - Enable RLS
    - Add strict policies for user management
    - Ensure proper role checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;

-- Create new policies for profiles table
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;

CREATE POLICY "Admins can manage all user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update roles policies
DROP POLICY IF EXISTS "Admins can read roles" ON roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Admins can update roles" ON roles;

CREATE POLICY "Admins can manage all roles"
  ON roles
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create helper function to check if user can manage profiles
CREATE OR REPLACE FUNCTION can_manage_profile(profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    -- User can manage their own profile
    auth.uid() = profile_id
    -- Or user is an admin
    OR is_admin()
  );
END;
$$;

-- Create helper function to check if user can manage roles
CREATE OR REPLACE FUNCTION can_manage_roles()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN is_admin();
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_created_at ON user_roles(created_at);
CREATE INDEX IF NOT EXISTS idx_roles_created_at ON roles(created_at);