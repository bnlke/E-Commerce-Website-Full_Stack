/*
  # Fix Admin Role Function and Dependencies
  
  1. Changes
    - Updates is_admin() function without dropping it
    - Ensures admin role exists
    - Assigns admin role to specified user
    - Adds better error handling and logging
*/

-- Ensure admin role exists first
DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  -- Check if admin role exists
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- Create admin role if it doesn't exist
  IF admin_role_id IS NULL THEN
    INSERT INTO roles (name, description)
    VALUES ('admin', 'Administrator with full access')
    RETURNING id INTO admin_role_id;
    
    RAISE LOG 'Created admin role with ID %', admin_role_id;
  END IF;
END;
$$;

-- Update is_admin function without dropping it
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role_id uuid;
  user_has_role boolean;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  IF admin_role_id IS NULL THEN
    RAISE LOG 'Admin role not found in roles table';
    RETURN false;
  END IF;

  -- Check if user has admin role
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_id = admin_role_id
  ) INTO user_has_role;

  -- Log the check result
  RAISE LOG 'Admin check for user %. Role exists: %', auth.uid(), user_has_role;

  RETURN user_has_role;
END;
$$;

-- Function to assign admin role with better error handling
CREATE OR REPLACE FUNCTION assign_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found';
  END IF;

  -- Assign admin role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (target_user_id, admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Log successful assignment
  RAISE LOG 'Assigned admin role to user % (ID: %)', user_email, target_user_id;
END;
$$;

-- Assign admin role to the user
SELECT assign_admin('robertgabrielcoverca@gmail.com');