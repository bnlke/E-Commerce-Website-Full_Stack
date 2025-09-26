/*
  # Add Payment Methods Support
  
  1. New Tables
    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `card_type` (text)
      - `last_four` (text)
      - `expiry_date` (text)
      - `cardholder_name` (text)
      - `is_default` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Changes
    - Add payment_method_id to orders table
    - Add functions to manage payment methods
    - Update order functions to include payment details
  
  3. Security
    - Enable RLS
    - Add user-specific policies
*/

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  card_type text NOT NULL,
  last_four text NOT NULL,
  expiry_date text NOT NULL,
  cardholder_name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to set default payment method
CREATE OR REPLACE FUNCTION set_default_payment_method(p_payment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID for the payment method
  SELECT user_id INTO v_user_id
  FROM payment_methods
  WHERE id = p_payment_id;
  
  -- Verify user owns this payment method
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not have permission to modify this payment method';
  END IF;
  
  -- Set all payment methods for this user to non-default
  UPDATE payment_methods
  SET is_default = false
  WHERE user_id = v_user_id;
  
  -- Set the specified payment method as default
  UPDATE payment_methods
  SET 
    is_default = true,
    updated_at = now()
  WHERE id = p_payment_id;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;

-- Add payment_method_id to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'payment_method_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method_id uuid REFERENCES payment_methods(id);
  END IF;
END $$;

-- Drop existing functions that will be replaced
DROP FUNCTION IF EXISTS get_user_orders();
DROP FUNCTION IF EXISTS get_order_by_id(uuid);

-- Create function to get user orders with payment details
CREATE OR REPLACE FUNCTION get_user_orders()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
  payment_method_id uuid,
  payment_details jsonb,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.shipping_address_id,
    o.payment_method,
    o.payment_method_id,
    CASE 
      WHEN o.payment_method_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', pm.id,
            'card_type', pm.card_type,
            'last_four', pm.last_four,
            'expiry_date', pm.expiry_date,
            'cardholder_name', pm.cardholder_name
          )
          FROM payment_methods pm
          WHERE pm.id = o.payment_method_id
        )
      ELSE NULL
    END as payment_details,
    o.tracking_number,
    o.estimated_delivery,
    o.delivery_notes,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'product', jsonb_build_object(
              'name', p.name,
              'image_url', p.image_url,
              'slug', p.slug
            )
          )
        )
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items,
    CASE 
      WHEN o.shipping_address_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', ua.id,
            'name', ua.name,
            'address_line1', ua.address_line1,
            'address_line2', ua.address_line2,
            'city', ua.city,
            'state', ua.state,
            'postal_code', ua.postal_code,
            'country', ua.country,
            'phone', ua.phone
          )
          FROM user_addresses ua
          WHERE ua.id = o.shipping_address_id
        )
      ELSE NULL
    END as shipping_address
  FROM orders o
  WHERE o.user_id = auth.uid()
  ORDER BY o.created_at DESC;
END;
$$;

-- Create function to get order by ID with payment details
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
  payment_method_id uuid,
  payment_details jsonb,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.shipping_address_id,
    o.payment_method,
    o.payment_method_id,
    CASE 
      WHEN o.payment_method_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', pm.id,
            'card_type', pm.card_type,
            'last_four', pm.last_four,
            'expiry_date', pm.expiry_date,
            'cardholder_name', pm.cardholder_name
          )
          FROM payment_methods pm
          WHERE pm.id = o.payment_method_id
        )
      ELSE NULL
    END as payment_details,
    o.tracking_number,
    o.estimated_delivery,
    o.delivery_notes,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'product', jsonb_build_object(
              'name', p.name,
              'image_url', p.image_url,
              'slug', p.slug
            )
          )
        )
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items,
    CASE 
      WHEN o.shipping_address_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', ua.id,
            'name', ua.name,
            'address_line1', ua.address_line1,
            'address_line2', ua.address_line2,
            'city', ua.city,
            'state', ua.state,
            'postal_code', ua.postal_code,
            'country', ua.country,
            'phone', ua.phone
          )
          FROM user_addresses ua
          WHERE ua.id = o.shipping_address_id
        )
      ELSE NULL
    END as shipping_address
  FROM orders o
  WHERE o.id = p_order_id
    AND o.user_id = auth.uid();
END;
$$;