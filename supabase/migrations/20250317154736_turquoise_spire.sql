/*
  # Update Leggings Category and Sizes
  
  1. Changes
    - Add Women's Leggings category if not exists
    - Update leggings products to use correct category
    - Set up proper clothing sizes
  
  2. Security
    - Maintains existing RLS policies
*/

-- Add Women's Leggings category if it doesn't exist
INSERT INTO product_categories (name, description, parent_id)
SELECT 
  'Women''s Leggings',
  'Comfortable and stylish leggings for women',
  parent.id
FROM product_categories parent
WHERE parent.name = 'Women''s'
  AND NOT EXISTS (
    SELECT 1 FROM product_categories 
    WHERE name = 'Women''s Leggings'
  )
ON CONFLICT (name) DO NOTHING;

-- Update leggings products to use correct category
UPDATE products
SET 
  category_id = (SELECT id FROM product_categories WHERE name = 'Women''s Leggings'),
  updated_at = now()
WHERE slug LIKE '%leggings%';

-- Update sizes for leggings products
DO $$
DECLARE
  leggings_product RECORD;
  v_size text;
  v_initial_stock integer;
BEGIN
  -- Get all leggings products
  FOR leggings_product IN
    SELECT p.id
    FROM products p
    JOIN product_categories pc ON p.category_id = pc.id
    WHERE pc.name = 'Women''s Leggings'
  LOOP
    -- Delete existing sizes
    DELETE FROM product_sizes
    WHERE product_id = leggings_product.id;

    -- Insert new clothing sizes
    FOREACH v_size IN ARRAY ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']
    LOOP
      v_initial_stock := floor(random() * 20 + 5)::integer;
      
      INSERT INTO product_sizes (
        product_id,
        size,
        stock_quantity
      ) VALUES (
        leggings_product.id,
        v_size,
        v_initial_stock
      );
    END LOOP;

    -- Update product status
    UPDATE products
    SET stock_status = CASE
      WHEN EXISTS (
        SELECT 1 FROM product_sizes ps
        WHERE ps.product_id = leggings_product.id
        AND ps.stock_quantity <= 10
      ) THEN 'low_stock'
      ELSE 'in_stock'
    END
    WHERE id = leggings_product.id;
  END LOOP;
END;
$$;