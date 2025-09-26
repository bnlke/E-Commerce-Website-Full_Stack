/*
  # Add Initial Shoe Sizes
  
  1. Changes
    - Add initial sizes for Nike Air Force 1
    - Add sizes for other shoe categories
    - Set initial stock quantities
  
  2. Security
    - Maintains existing RLS policies
*/

-- Function to get product ID by slug
CREATE OR REPLACE FUNCTION get_product_id_by_slug(p_slug text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id uuid;
BEGIN
  SELECT id INTO v_product_id
  FROM products
  WHERE slug = p_slug;
  RETURN v_product_id;
END;
$$;

-- Add sizes for Nike Air Force 1
DO $$
DECLARE
  v_product_id uuid;
BEGIN
  -- Get product ID
  SELECT get_product_id_by_slug('nike-air-force-1') INTO v_product_id;
  
  -- Insert sizes with initial stock
  INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
    (v_product_id, '41', 10),
    (v_product_id, '42', 15),
    (v_product_id, '43', 20),
    (v_product_id, '44', 15),
    (v_product_id, '45', 10),
    (v_product_id, '46', 5)
  ON CONFLICT (product_id, size) DO UPDATE
  SET stock_quantity = EXCLUDED.stock_quantity;
END;
$$;

-- Add sizes for men's shoes
DO $$
DECLARE
  product record;
BEGIN
  FOR product IN
    SELECT id FROM products 
    WHERE category_id IN (
      SELECT id FROM product_categories 
      WHERE name LIKE 'Men%'
    )
    AND id != get_product_id_by_slug('nike-air-force-1')
  LOOP
    INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
      (product.id, '41', floor(random() * 20 + 5)::int),
      (product.id, '42', floor(random() * 20 + 5)::int),
      (product.id, '43', floor(random() * 20 + 5)::int),
      (product.id, '44', floor(random() * 20 + 5)::int),
      (product.id, '45', floor(random() * 20 + 5)::int),
      (product.id, '46', floor(random() * 20 + 5)::int)
    ON CONFLICT (product_id, size) DO NOTHING;
  END LOOP;
END;
$$;

-- Add sizes for women's shoes
DO $$
DECLARE
  product record;
BEGIN
  FOR product IN
    SELECT id FROM products 
    WHERE category_id IN (
      SELECT id FROM product_categories 
      WHERE name LIKE 'Women%'
    )
  LOOP
    INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
      (product.id, '36', floor(random() * 20 + 5)::int),
      (product.id, '37', floor(random() * 20 + 5)::int),
      (product.id, '38', floor(random() * 20 + 5)::int),
      (product.id, '39', floor(random() * 20 + 5)::int),
      (product.id, '40', floor(random() * 20 + 5)::int),
      (product.id, '41', floor(random() * 20 + 5)::int)
    ON CONFLICT (product_id, size) DO NOTHING;
  END LOOP;
END;
$$;

-- Add sizes for kids' shoes
DO $$
DECLARE
  product record;
BEGIN
  FOR product IN
    SELECT id FROM products 
    WHERE category_id IN (
      SELECT id FROM product_categories 
      WHERE name LIKE 'Kids%'
    )
  LOOP
    INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
      (product.id, '32', floor(random() * 20 + 5)::int),
      (product.id, '33', floor(random() * 20 + 5)::int),
      (product.id, '34', floor(random() * 20 + 5)::int),
      (product.id, '35', floor(random() * 20 + 5)::int),
      (product.id, '36', floor(random() * 20 + 5)::int),
      (product.id, '37', floor(random() * 20 + 5)::int)
    ON CONFLICT (product_id, size) DO NOTHING;
  END LOOP;
END;
$$;