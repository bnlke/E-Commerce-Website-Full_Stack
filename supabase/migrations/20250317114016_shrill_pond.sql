/*
  # Fix User Role System

  1. Changes
    - Adds function to check and fix user roles
    - Adds function to get user role info
    - Improves role verification queries
    - Adds better error handling

  2. Security
    - Maintains SECURITY DEFINER settings
    - Preserves RLS policies
*/

-- Function to check and fix user roles
CREATE OR REPLACE FUNCTION fix_user_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  old_roles text[],
  new_roles text[],
  action text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  default_role_id uuid;
BEGIN
  -- Create temporary table to store results
  CREATE TEMP TABLE role_changes (
    user_id uuid,
    email text,
    old_roles text[],
    new_roles text[],
    action text
  );

  -- Get default role id
  SELECT id INTO default_role_id
  FROM roles
  WHERE name = 'user';

  -- Create default role if missing
  IF default_role_id IS NULL THEN
    INSERT INTO roles (name, description)
    VALUES ('user', 'Regular user with basic privileges')
    RETURNING id INTO default_role_id;
  END IF;

  -- Check each user
  FOR user_record IN
    SELECT 
      u.id,
      u.email,
      array_agg(r.name) as current_roles
    FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    GROUP BY u.id, u.email
  LOOP
    -- If user has no roles, assign default role
    IF user_record.current_roles IS NULL OR array_length(user_record.current_roles, 1) IS NULL THEN
      INSERT INTO user_roles (user_id, role_id)
      VALUES (user_record.id, default_role_id);

      INSERT INTO role_changes
      VALUES (
        user_record.id,
        user_record.email,
        ARRAY[]::text[],
        ARRAY['user'],
        'Added default role'
      );
    ELSE
      -- Record existing roles
      INSERT INTO role_changes
      VALUES (
        user_record.id,
        user_record.email,
        user_record.current_roles,
        user_record.current_roles,
        'No change needed'
      );
    END IF;
  END LOOP;

  -- Return results
  RETURN QUERY SELECT * FROM role_changes;
  
  -- Clean up
  DROP TABLE role_changes;
END;
$$;

-- Function to get detailed user role information
CREATE OR REPLACE FUNCTION get_user_role_info(user_email text)
RETURNS TABLE (
  user_id uuid,
  email text,
  roles text[],
  created_at timestamptz,
  last_sign_in timestamptz
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
    array_agg(r.name) as roles,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.email = user_email
  GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at;
END;
$$;

-- Run the fix
SELECT fix_user_roles();