/*
  # Fix Stock Synchronization Across Categories
  
  1. Changes
    - Update stock management to sync based on product name
    - Fix stock restoration to handle multiple category instances
    - Add proper error handling and validation
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;
DROP FUNCTION IF EXISTS restore_stock_on_cart_delete();
DROP FUNCTION IF EXISTS sync_product_stock();

-- Create improved function to restore stock
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
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
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = ps.stock_quantity + OLD.quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = OLD.size;

  -- Update stock status for all products with the same name
  UPDATE products p
  SET stock_status = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM product_sizes ps2
      WHERE ps2.product_id = p.id
      AND ps2.stock_quantity > 0
    ) THEN 'out_of_stock'
    WHEN EXISTS (
      SELECT 1 FROM product_sizes ps2
      WHERE ps2.product_id = p.id
      AND ps2.stock_quantity <= 10
    ) THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  -- Log the update
  RAISE NOTICE 'Stock restored for product name: %, size: %, quantity: %',
    v_product_name, OLD.size, OLD.quantity;

  RETURN OLD;
END;
$$;

-- Function to sync stock across same products
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

  -- Update stock status for all products with the same name
  UPDATE products p
  SET stock_status = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM product_sizes ps2
      WHERE ps2.product_id = p.id
      AND ps2.stock_quantity > 0
    ) THEN 'out_of_stock'
    WHEN EXISTS (
      SELECT 1 FROM product_sizes ps2
      WHERE ps2.product_id = p.id
      AND ps2.stock_quantity <= 10
    ) THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();

CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();