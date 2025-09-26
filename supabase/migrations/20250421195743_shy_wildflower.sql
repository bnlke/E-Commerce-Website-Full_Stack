/*
  # Fix Payment Methods RLS Policy
  
  1. Changes
    - Update the RLS policy for payment_methods table
    - Fix the user_id reference to use auth.uid() instead of profiles.id
    - Ensure proper permissions for inserting new payment methods
  
  2. Security
    - Maintain existing security model
    - Fix policy to allow authenticated users to manage their payment methods
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete own payment methods" ON payment_methods;

-- Recreate policies with correct user_id reference
CREATE POLICY "Users can view own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());