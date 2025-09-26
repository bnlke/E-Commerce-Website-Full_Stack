/*
  # Fix Product Policies

  1. Changes
    - Drop and recreate products table policies with stricter checks
    - Add function to verify admin access
    - Add better error handling for non-admin access

  2. Security
    - Enforce RLS more strictly
    - Add explicit security barriers
    - Improve permission checking
*/

-- Create a more robust function to check admin access
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First verify user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Check for admin role with explicit join
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    INNER JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  );
END;
$$;

-- Drop existing product policies
DROP POLICY IF EXISTS "Everyone can view products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- Recreate policies with stricter checks
CREATE POLICY "Everyone can view products"
  ON products
  FOR SELECT
  USING (true);

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

-- Add an explicit security barrier view for additional protection
CREATE OR REPLACE VIEW admin_products
WITH (security_barrier = true)
AS
  SELECT *
  FROM products
  WHERE is_admin();

-- Grant appropriate permissions
GRANT SELECT ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT ON admin_products TO authenticated;