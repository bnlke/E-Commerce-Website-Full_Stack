/*
  # Implement Shared Stock Management
  
  1. Changes
    - Add function to sync stock across same products
    - Update stock management to use product name as identifier
    - Fix stock restoration to maintain consistency
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Function to sync stock across products with same name
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = NEW.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = NEW.stock_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = NEW.size
  AND ps.id != NEW.id;

  -- Update stock status for all related products
  UPDATE products p
  SET stock_status = CASE
    WHEN NEW.stock_quantity = 0 THEN 'out_of_stock'
    WHEN NEW.stock_quantity <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  RETURN NEW;
END;
$$;

-- Create trigger for stock synchronization
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();

-- Create improved function to handle stock updates
CREATE OR REPLACE FUNCTION increment_stock(
  p_product_id uuid,
  p_size text,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_current_quantity integer;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = p_product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get current quantity with lock
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = p_product_id
  AND size = p_size
  FOR UPDATE;

  IF v_current_quantity IS NULL THEN
    RAISE EXCEPTION 'Product size combination not found';
  END IF;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_current_quantity + p_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = p_size;

  -- Update stock status for all related products
  UPDATE products p
  SET stock_status = CASE
    WHEN (v_current_quantity + p_quantity) = 0 THEN 'out_of_stock'
    WHEN (v_current_quantity + p_quantity) <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  -- Log the update
  RAISE NOTICE 'Stock updated for product %, size %: % -> %',
    v_product_name, p_size, v_current_quantity, v_current_quantity + p_quantity;
END;
$$;