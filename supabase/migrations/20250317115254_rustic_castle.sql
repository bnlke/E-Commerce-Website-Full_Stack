/*
  # Fix Verify Role Assignments Function

  1. Changes
    - Drop existing function
    - Recreate with proper type handling and explicit casts
    - Add better error handling
    - Improve role aggregation logic

  2. Security
    - Maintains SECURITY DEFINER
    - Uses explicit schema references
*/

-- Drop existing function
DROP FUNCTION IF EXISTS verify_role_assignments();

-- Recreate with proper type handling
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
  WITH role_assignments AS (
    SELECT 
      u.id,
      u.email::text,
      array_remove(array_agg(DISTINCT r.name::text), NULL) as user_roles
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN public.roles r ON ur.role_id = r.id
    GROUP BY u.id, u.email
  )
  SELECT
    ra.id,
    ra.email,
    COALESCE(ra.user_roles, ARRAY['user']::text[]) as roles
  FROM role_assignments ra;

EXCEPTION WHEN OTHERS THEN
  -- Log error and return empty result
  RAISE LOG 'Error in verify_role_assignments: %', SQLERRM;
  RETURN;
END;
$$;