/*
  # Add Product Setup Function
  
  1. Changes
    - Add function to automatically set up stock and sizes for new products
    - Configure default sizes based on product category
    - Set initial stock quantities
  
  2. Security
    - Maintains SECURITY DEFINER setting
    - Uses explicit schema references
*/

-- Function to set up new product with sizes and stock
CREATE OR REPLACE FUNCTION setup_product_sizes(
  p_product_id uuid,
  p_category_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sizes text[];
  v_size text;
  v_initial_stock integer;
BEGIN
  -- Determine sizes based on category
  v_sizes := CASE
    WHEN p_category_name ILIKE '%men%' THEN
      ARRAY['40', '41', '42', '43', '44', '45', '46']
    WHEN p_category_name ILIKE '%women%' THEN
      ARRAY['36', '37', '38', '39', '40', '41']
    WHEN p_category_name ILIKE '%kids%' THEN
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
      p_product_id,
      v_size,
      v_initial_stock
    ) ON CONFLICT (product_id, size) DO UPDATE
    SET stock_quantity = v_initial_stock;
  END LOOP;

  -- Update product status based on stock levels
  UPDATE products p
  SET stock_status = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = p.id
      AND ps.stock_quantity > 0
    ) THEN 'out_of_stock'
    WHEN EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = p.id
      AND ps.stock_quantity <= 10
    ) THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE id = p_product_id;

  -- Log the setup
  RAISE NOTICE 'Product sizes set up for product % with category %', p_product_id, p_category_name;
END;
$$;

-- Create trigger function to automatically set up sizes for new products
CREATE OR REPLACE FUNCTION trigger_setup_product_sizes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category_name text;
BEGIN
  -- Get category name
  SELECT name INTO v_category_name
  FROM product_categories
  WHERE id = NEW.category_id;

  -- Set up sizes
  PERFORM setup_product_sizes(NEW.id, v_category_name);
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER setup_product_sizes_trigger
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_setup_product_sizes();