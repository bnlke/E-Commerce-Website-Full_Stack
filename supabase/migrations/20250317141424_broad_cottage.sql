/*
  # Set up Nike 12 Product Data
  
  1. Changes
    - Update Nike 12 product details
    - Set up proper sizes and stock
    - Add better product description
    - Use placeholder image URL
*/

-- Update Nike 12 product with better details
UPDATE products
SET
  name = 'Nike Air Max 12',
  description = 'The Nike Air Max 12 combines style with unmatched comfort. Featuring responsive cushioning, breathable mesh upper, and durable construction for all-day wear. Perfect for both athletic performance and casual style.',
  price = 159.99,
  image_url = 'https://via.placeholder.com/800x800',
  category_id = (SELECT id FROM product_categories WHERE name = 'Men''s Trainers' LIMIT 1)
WHERE slug = 'nike-12';

-- Set up specific stock quantities for each size
DO $$
DECLARE
  v_product_id uuid;
BEGIN
  -- Get product ID
  SELECT id INTO v_product_id
  FROM products
  WHERE slug = 'nike-12';

  -- Insert sizes with specific stock quantities
  INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
    (v_product_id, '40', 15),  -- Good stock
    (v_product_id, '41', 20),  -- Good stock
    (v_product_id, '42', 25),  -- Good stock
    (v_product_id, '43', 3),   -- Low stock
    (v_product_id, '44', 1),   -- Very low stock
    (v_product_id, '45', 0),   -- Out of stock
    (v_product_id, '46', 10)   -- Medium stock
  ON CONFLICT (product_id, size) 
  DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

  -- Update product status based on stock levels
  UPDATE products
  SET stock_status = CASE
    WHEN EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = v_product_id
      AND ps.stock_quantity <= 3
    ) THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE id = v_product_id;
END;
$$;