/*
  # Add Product Categories and Management

  1. New Tables
    - `product_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)

  2. Changes
    - Add category_id to products table
    - Add image_url to products table
    - Add stock_status to products table

  3. Security
    - Enable RLS
    - Add admin-only policies
*/

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id),
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'in_stock';

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Policies for product categories
CREATE POLICY "Everyone can view product categories"
  ON product_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage product categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Insert default categories
INSERT INTO product_categories (name, description) VALUES
  ('Men''s Shoes', 'Footwear for men'),
  ('Women''s Shoes', 'Footwear for women'),
  ('Kids'' Shoes', 'Footwear for children'),
  ('Accessories', 'Additional items and accessories')
ON CONFLICT (name) DO NOTHING;