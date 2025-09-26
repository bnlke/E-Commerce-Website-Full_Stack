/*
  # Fix Role-Based Access Control Policies
  
  1. Changes
    - Fixes role assignment trigger
    - Updates RLS policies
    - Adds missing role checks
  
  2. Security
    - Ensures proper role enforcement
    - Fixes policy permissions
*/

-- Drop and recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get default role id first
  SELECT id INTO default_role_id
  FROM roles
  WHERE name = 'user';
  
  IF default_role_id IS NULL THEN
    -- Create the user role if it doesn't exist
    INSERT INTO roles (name, description)
    VALUES ('user', 'Regular user with basic privileges')
    RETURNING id INTO default_role_id;
  END IF;

  -- Create profile with explicit id reference
  INSERT INTO public.profiles (id, created_at)
  VALUES (NEW.id, now())
  ON CONFLICT (id) DO NOTHING;

  -- Assign default role with explicit reference to profiles
  INSERT INTO public.user_roles (user_id, role_id, created_at)
  VALUES (NEW.id, default_role_id, now())
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Recreate the check_user_permission function with better role checking
CREATE OR REPLACE FUNCTION public.check_user_permission(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user has the required role
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = required_role
  );
END;
$$;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Everyone can view products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- Recreate products policies with proper checks
CREATE POLICY "Everyone can view products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (check_user_permission('admin'));

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (check_user_permission('admin'))
  WITH CHECK (check_user_permission('admin'));

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (check_user_permission('admin'));

-- Function to verify role assignments
CREATE OR REPLACE FUNCTION verify_role_assignments()
RETURNS TABLE (
  user_id uuid,
  email text,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    array_agg(r.name) as roles
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  GROUP BY u.id, u.email;
END;
$$;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_composite ON user_roles(user_id, role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Function to fix missing user roles
CREATE OR REPLACE FUNCTION fix_missing_user_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  default_role_id uuid;
BEGIN
  -- Get default role id
  SELECT id INTO default_role_id
  FROM roles
  WHERE name = 'user';

  -- Create default role if it doesn't exist
  IF default_role_id IS NULL THEN
    INSERT INTO roles (name, description)
    VALUES ('user', 'Regular user with basic privileges')
    RETURNING id INTO default_role_id;
  END IF;

  -- Find users without roles and assign default role
  FOR user_record IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.id IS NULL
  LOOP
    INSERT INTO user_roles (user_id, role_id)
    VALUES (user_record.id, default_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END LOOP;
END;
$$;

-- Run the fix
SELECT fix_missing_user_roles();