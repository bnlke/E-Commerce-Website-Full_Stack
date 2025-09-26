/*
  # Add User Addresses Table
  
  1. New Tables
    - `user_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text) - Address name/label
      - `address_line1` (text)
      - `address_line2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `is_default` (boolean)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create user addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own addresses"
  ON user_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON user_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to set default address
CREATE OR REPLACE FUNCTION set_default_address(p_address_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID for the address
  SELECT user_id INTO v_user_id
  FROM user_addresses
  WHERE id = p_address_id;
  
  -- Verify user owns this address
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not have permission to modify this address';
  END IF;
  
  -- Set all addresses for this user to non-default
  UPDATE user_addresses
  SET is_default = false
  WHERE user_id = v_user_id;
  
  -- Set the specified address as default
  UPDATE user_addresses
  SET 
    is_default = true,
    updated_at = now()
  WHERE id = p_address_id;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;