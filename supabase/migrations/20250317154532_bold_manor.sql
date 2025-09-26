/*
  # Update Sizing System for Clothing
  
  1. Changes
    - Update setup_product_stock function to handle clothing sizes
    - Add clothing-specific size handling
    - Update stock management for apparel items
  
  2. Security
    - Maintains existing RLS policies
*/

-- Update the setup_product_stock function to handle clothing sizes
CREATE OR REPLACE FUNCTION setup_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category_name text;
  v_sizes text[];
  v_size text;
  v_initial_stock integer;
BEGIN
  -- Get category name
  SELECT name INTO v_category_name
  FROM product_categories
  WHERE id = NEW.category_id;

  -- Determine sizes based on category
  v_sizes := CASE
    -- Clothing sizes
    WHEN v_category_name ILIKE '%leggings%' OR 
         v_category_name ILIKE '%tops%' OR 
         v_category_name ILIKE '%apparel%' OR
         v_category_name ILIKE '%clothing%' OR
         v_category_name ILIKE '%jeans%' THEN
      ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']
    -- Men's shoes
    WHEN v_category_name ILIKE '%men%' AND 
         (v_category_name ILIKE '%shoes%' OR 
          v_category_name ILIKE '%trainers%' OR 
          v_category_name ILIKE '%boots%') THEN
      ARRAY['40', '41', '42', '43', '44', '45', '46']
    -- Women's shoes
    WHEN v_category_name ILIKE '%women%' AND 
         (v_category_name ILIKE '%shoes%' OR 
          v_category_name ILIKE '%trainers%' OR 
          v_category_name ILIKE '%boots%') THEN
      ARRAY['36', '37', '38', '39', '40', '41']
    -- Kids' shoes
    WHEN v_category_name ILIKE '%kids%' AND 
         (v_category_name ILIKE '%shoes%' OR 
          v_category_name ILIKE '%trainers%' OR 
          v_category_name ILIKE '%boots%') THEN
      ARRAY['32', '33', '34', '35', '36', '37']
    ELSE
      ARRAY['40', '41', '42', '43', '44'] -- Default sizes
  END;

  -- Insert sizes with random initial stock
  FOREACH v_size IN ARRAY v_sizes
  LOOP
    -- Generate random stock between 5 and 25
    v_initial_stock := floor(random() * 20 + 5)::integer;
    
    INSERT INTO product_sizes (
      product_id,
      size,
      stock_quantity
    ) VALUES (
      NEW.id,
      v_size,
      v_initial_stock
    ) ON CONFLICT (product_id, size) DO UPDATE
    SET stock_quantity = EXCLUDED.stock_quantity;
  END LOOP;

  -- Update product status based on stock levels
  UPDATE products
  SET stock_status = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = NEW.id
      AND ps.stock_quantity > 0
    ) THEN 'out_of_stock'
    WHEN EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = NEW.id
      AND ps.stock_quantity <= 10
    ) THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Update existing clothing products with new sizes
DO $$
DECLARE
  product_record RECORD;
  v_size text;
  v_initial_stock integer;
BEGIN
  -- Get all clothing products
  FOR product_record IN
    SELECT p.id
    FROM products p
    JOIN product_categories pc ON p.category_id = pc.id
    WHERE 
      pc.name ILIKE '%leggings%' OR 
      pc.name ILIKE '%tops%' OR 
      pc.name ILIKE '%apparel%' OR
      pc.name ILIKE '%clothing%' OR
      pc.name ILIKE '%jeans%'
  LOOP
    -- Delete existing sizes
    DELETE FROM product_sizes
    WHERE product_id = product_record.id;

    -- Insert new clothing sizes
    FOREACH v_size IN ARRAY ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL']
    LOOP
      v_initial_stock := floor(random() * 20 + 5)::integer;
      
      INSERT INTO product_sizes (
        product_id,
        size,
        stock_quantity
      ) VALUES (
        product_record.id,
        v_size,
        v_initial_stock
      );
    END LOOP;
  END LOOP;
END;
$$;