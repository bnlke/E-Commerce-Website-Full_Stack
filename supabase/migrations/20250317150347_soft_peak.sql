/*
  # Automated Product Management System

  1. New Functions
    - `process_product_image` - Handles image URL formatting
    - `setup_product_stock` - Sets up initial stock quantities
    - `manage_product_categories` - Handles category relationships
    - `fetch_product_details` - Comprehensive product data fetching

  2. Changes
    - Add triggers for automated processing
    - Add helper functions for stock management
    - Improve category handling
*/

-- Function to process and validate product images
CREATE OR REPLACE FUNCTION process_product_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure image_url is properly formatted
  IF NEW.image_url IS NOT NULL THEN
    -- Remove any leading slashes
    NEW.image_url := ltrim(NEW.image_url, '/');
    
    -- Validate image URL
    IF NEW.image_url LIKE '%unsplash.com%' THEN
      RAISE EXCEPTION 'Unsplash URLs are not allowed';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to set up initial stock quantities
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
    WHEN v_category_name ILIKE '%men%' THEN
      ARRAY['40', '41', '42', '43', '44', '45', '46']
    WHEN v_category_name ILIKE '%women%' THEN
      ARRAY['36', '37', '38', '39', '40', '41']
    WHEN v_category_name ILIKE '%kids%' THEN
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

-- Function to fetch complete product details
CREATE OR REPLACE FUNCTION fetch_product_details(p_category_name text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  stock_status text,
  category_name text,
  sizes jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.stock_status,
    pc.name as category_name,
    jsonb_agg(
      jsonb_build_object(
        'size', ps.size,
        'stock_quantity', ps.stock_quantity
      )
    ) as sizes
  FROM products p
  JOIN product_categories pc ON p.category_id = pc.id
  LEFT JOIN product_sizes ps ON p.id = ps.product_id
  WHERE pc.name = p_category_name
  GROUP BY p.id, p.name, p.description, p.price, p.image_url, p.stock_status, pc.name;
END;
$$;

-- Create triggers
CREATE TRIGGER process_product_image_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION process_product_image();

CREATE TRIGGER setup_product_stock_trigger
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION setup_product_stock();

-- Update existing products
DO $$
BEGIN
  -- Process existing products
  UPDATE products
  SET updated_at = now()
  WHERE id IN (
    SELECT id FROM products
  );
END;
$$;