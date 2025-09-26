/*
  # Fix Stock Synchronization
  
  1. Changes
    - Add original_quantity column to cart table
    - Update stock handling to track original quantities
    - Fix synchronization across product views
    - Improve error handling and logging
*/

-- Add original_quantity to cart table
ALTER TABLE cart 
ADD COLUMN IF NOT EXISTS original_quantity integer;

-- Function to sync stock across products with same name
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

  -- Get the base quantity for this size
  SELECT MIN(stock_quantity) INTO v_base_quantity
  FROM product_sizes ps
  JOIN products p ON p.id = ps.product_id
  WHERE p.name = v_product_name
  AND ps.size = NEW.size;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_base_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = NEW.size;

  -- Update stock status for all related products
  UPDATE products p
  SET stock_status = CASE
    WHEN v_base_quantity = 0 THEN 'out_of_stock'
    WHEN v_base_quantity <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  RETURN NEW;
END;
$$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;

-- Create trigger for stock synchronization
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();

-- Function to restore stock on cart item removal
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_original_quantity integer;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get original quantity before cart addition
  v_original_quantity := OLD.original_quantity;
  
  IF v_original_quantity IS NULL THEN
    -- Fallback to current quantity if original not stored
    SELECT stock_quantity INTO v_original_quantity
    FROM product_sizes
    WHERE product_id = OLD.product_id
    AND size = OLD.size;
  END IF;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_original_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = OLD.size;

  -- Update stock status
  UPDATE products p
  SET stock_status = CASE
    WHEN v_original_quantity = 0 THEN 'out_of_stock'
    WHEN v_original_quantity <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  RETURN OLD;
END;
$$;

-- Create trigger for stock restoration
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();