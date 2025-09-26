/*
  # Fix Stock Synchronization
  
  1. Changes
    - Drop existing triggers
    - Create new function to handle stock updates
    - Add proper synchronization across all views
    - Fix stock doubling issue
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;

-- Create function to get base stock quantity
CREATE OR REPLACE FUNCTION get_base_stock_quantity(p_product_name text, p_size text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quantity integer;
BEGIN
  SELECT MIN(ps.stock_quantity) INTO v_quantity
  FROM product_sizes ps
  JOIN products p ON p.id = ps.product_id
  WHERE p.name = p_product_name
  AND ps.size = p_size;
  
  RETURN COALESCE(v_quantity, 0);
END;
$$;

-- Create function to sync stock status
CREATE OR REPLACE FUNCTION sync_stock_status(p_product_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products p
  SET stock_status = (
    SELECT 
      CASE
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
  )
  WHERE name = p_product_name;
END;
$$;

-- Create improved function to restore stock
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_base_quantity integer;
  v_new_quantity integer;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get base quantity
  v_base_quantity := get_base_stock_quantity(v_product_name, OLD.size);
  
  -- Calculate new quantity
  v_new_quantity := v_base_quantity + OLD.quantity;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_new_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = OLD.size;

  -- Sync stock status
  PERFORM sync_stock_status(v_product_name);

  -- Log the update
  RAISE NOTICE 'Stock restored for product %, size %: % -> %',
    v_product_name, OLD.size, v_base_quantity, v_new_quantity;

  RETURN OLD;
END;
$$;

-- Create trigger for stock restoration
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();

-- Function to sync stock across products
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_base_quantity integer;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = NEW.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get base quantity
  v_base_quantity := get_base_stock_quantity(v_product_name, NEW.size);

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_base_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = NEW.size
  AND ps.id != NEW.id;

  -- Sync stock status
  PERFORM sync_stock_status(v_product_name);

  RETURN NEW;
END;
$$;

-- Create trigger for stock synchronization
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();