/*
  # Fix Admin Role Assignment
  
  1. Changes
    - Creates a function to assign admin role by email
    - Ensures admin role exists
    - Adds proper error handling
*/

-- Ensure admin role exists
DO $$
DECLARE
  admin_role_id uuid;
BEGIN
  INSERT INTO roles (name, description)
  VALUES ('admin', 'Administrator with full access')
  ON CONFLICT (name) DO NOTHING
  RETURNING id INTO admin_role_id;
END;
$$;

-- Create function to assign admin role by email
CREATE OR REPLACE FUNCTION assign_admin_by_email(user_email text)
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

  -- Assign admin role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (target_user_id, admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- Log successful assignment
  RAISE LOG 'Admin role assigned to user %', user_email;
END;
$$;

-- Assign admin role to specific email
SELECT assign_admin_by_email('robertgabrielcoverca@gmail.com');