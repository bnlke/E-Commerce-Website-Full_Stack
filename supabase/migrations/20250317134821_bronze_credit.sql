/*
  # Add Test Product with Stock
  
  1. New Data
    - Creates a test product with specific stock quantities
    - Adds sizes with controlled stock numbers for testing
  
  2. Changes
    - Inserts new test product with placeholder image
    - Sets up stock quantities for testing
*/

-- Create test product
INSERT INTO products (
  name,
  description,
  price,
  slug,
  image_url,
  stock_status
) VALUES (
  'Test Runner',
  'A product for testing stock functionality',
  99.99,
  'test-runner',
  'https://via.placeholder.com/800x800',
  'in_stock'
) ON CONFLICT (slug) DO NOTHING;

-- Add specific stock quantities
DO $$
DECLARE
  v_product_id uuid;
BEGIN
  -- Get product ID
  SELECT id INTO v_product_id
  FROM products
  WHERE slug = 'test-runner';
  
  -- Insert sizes with specific stock quantities
  INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
    (v_product_id, '40', 3),  -- Low stock
    (v_product_id, '41', 1),  -- Very low stock
    (v_product_id, '42', 0),  -- Out of stock
    (v_product_id, '43', 10), -- Good stock
    (v_product_id, '44', 5),  -- Medium stock
    (v_product_id, '45', 2)   -- Low stock
  ON CONFLICT (product_id, size) 
  DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
END;
$$;