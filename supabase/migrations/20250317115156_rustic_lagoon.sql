/*
  # Fix Admin Check Function with Dependencies

  1. Changes
    - Drop existing function and dependent objects with CASCADE
    - Recreate is_admin() function with improved checks
    - Recreate dependent policies and views
    - Add better error handling and logging

  2. Security
    - Maintains SECURITY DEFINER settings
    - Uses explicit schema references
*/

-- Drop everything that depends on is_admin() first
DROP VIEW IF EXISTS admin_products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Recreate the is_admin function with improved checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role_id uuid;
  has_role boolean;
BEGIN
  -- First verify user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM public.roles
  WHERE name = 'admin';

  -- Check for admin role with explicit join
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role_id = admin_role_id
  ) INTO has_role;

  -- Log check result for debugging
  RAISE LOG 'is_admin check for user %: %', auth.uid(), has_role;

  RETURN has_role;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in is_admin check: %', SQLERRM;
    RETURN false;
END;
$$;

-- Recreate the policies
CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Recreate the admin view
CREATE OR REPLACE VIEW admin_products
WITH (security_barrier = true)
AS
  SELECT *
  FROM products
  WHERE is_admin();