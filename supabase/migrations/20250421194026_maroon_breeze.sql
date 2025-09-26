/*
  # Fix User Addresses RLS Policies
  
  1. Changes
    - Drop existing RLS policies for user_addresses table
    - Create new policies with proper user_id checks
    - Ensure users can insert their own addresses
    - Fix policy for viewing, updating, and deleting addresses
  
  2. Security
    - Maintain RLS enabled
    - Ensure proper user authentication checks
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;

-- Create new policies with proper checks
CREATE POLICY "Users can insert own addresses"
  ON user_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own addresses"
  ON user_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;