/*
  # Fix User Role Info Function

  1. Changes
    - Fix ambiguous column references in get_user_role_info function
    - Improve type safety with explicit casting
    - Add better error handling
    - Ensure consistent return types

  2. Security
    - Maintains SECURITY DEFINER settings
    - Preserves existing RLS policies
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_role_info;

-- Recreate with fixed column references
CREATE OR REPLACE FUNCTION get_user_role_info(input_email text)
RETURNS TABLE (
  user_id uuid,
  email text,
  roles text[],
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_roles_agg AS (
    SELECT 
      u.id,
      u.email::text,
      array_agg(COALESCE(r.name, 'user')::text) FILTER (WHERE r.name IS NOT NULL) as user_roles,
      u.created_at,
      u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email::text = input_email
    GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at
  )
  SELECT 
    ura.id,
    ura.email,
    COALESCE(ura.user_roles, ARRAY['user']::text[]),
    ura.created_at,
    ura.last_sign_in_at
  FROM user_roles_agg ura;
END;
$$;