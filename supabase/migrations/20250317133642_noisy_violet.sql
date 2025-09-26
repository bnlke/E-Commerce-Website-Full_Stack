/*
  # Add Product Sizes and Stock Management
  
  1. New Tables
    - `product_sizes`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `size` (text)
      - `stock_quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for stock management
*/

-- Create product sizes table
CREATE TABLE product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size)
);

-- Enable RLS
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view product sizes"
  ON product_sizes
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage product sizes"
  ON product_sizes
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Function to update stock quantity
CREATE OR REPLACE FUNCTION update_stock_quantity(
  p_product_id uuid,
  p_size text,
  p_quantity_change integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE product_sizes
  SET 
    stock_quantity = stock_quantity + p_quantity_change,
    updated_at = now()
  WHERE product_id = p_product_id AND size = p_size;
END;
$$;