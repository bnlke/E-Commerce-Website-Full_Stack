/*
  # Fix Admin Role Assignment
  
  1. Changes
    - Ensures admin role exists
    - Adds function to assign admin role
    - Assigns admin role to specified user
*/

-- Ensure admin role exists
INSERT INTO roles (name, description)
VALUES ('admin', 'Administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Create function to assign admin role
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
  -- Get user ID from auth schema
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
END;
$$;

-- Assign admin role to your email
SELECT assign_admin('robertgabrielcoverca@gmail.com');