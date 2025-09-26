/*
  # Fix verify_role_assignments Function
  
  1. Changes
    - Drops existing function before recreating
    - Updates return type to match expected structure
    - Improves type handling and column naming
  
  2. Security
    - Maintains SECURITY DEFINER setting
    - Preserves existing security context
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS verify_role_assignments();

-- Recreate the function with proper return type
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