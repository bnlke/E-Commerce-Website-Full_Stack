/*
  # Fix Stock Synchronization for Duplicate Products
  
  1. Changes
    - Add transaction control to prevent race conditions
    - Use row-level locking to ensure consistency
    - Fix stock restoration to prevent doubling
    - Improve error handling and logging
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;

-- Function to get primary product ID
CREATE OR REPLACE FUNCTION get_primary_product_id(p_product_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id uuid;
BEGIN
  -- Get the first product ID with this name (primary instance)
  SELECT id INTO v_product_id
  FROM products
  WHERE name = p_product_name
  ORDER BY created_at ASC
  LIMIT 1;
  
  RETURN v_product_id;
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
  v_primary_id uuid;
  v_current_quantity integer;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get primary product ID
  v_primary_id := get_primary_product_id(v_product_name);

  -- Lock the primary product's size row to prevent concurrent updates
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = v_primary_id
  AND size = OLD.size
  FOR UPDATE;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_current_quantity + OLD.quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = OLD.size;

  -- Update stock status for all related products
  UPDATE products p
  SET stock_status = CASE
    WHEN (v_current_quantity + OLD.quantity) = 0 THEN 'out_of_stock'
    WHEN (v_current_quantity + OLD.quantity) <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE name = v_product_name;

  -- Log the update
  RAISE NOTICE 'Stock restored for product % (primary: %), size %: % -> %',
    v_product_name, v_primary_id, OLD.size, v_current_quantity, v_current_quantity + OLD.quantity;

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
  v_primary_id uuid;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = NEW.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get primary product ID
  v_primary_id := get_primary_product_id(v_product_name);

  -- Only sync if this update is on the primary product
  IF NEW.product_id = v_primary_id THEN
    -- Update stock for all other instances
    UPDATE product_sizes ps
    SET 
      stock_quantity = NEW.stock_quantity,
      updated_at = now()
    FROM products p
    WHERE p.id = ps.product_id
    AND p.name = v_product_name
    AND ps.size = NEW.size
    AND ps.id != NEW.id;

    -- Update stock status
    UPDATE products p
    SET stock_status = CASE
      WHEN NEW.stock_quantity = 0 THEN 'out_of_stock'
      WHEN NEW.stock_quantity <= 10 THEN 'low_stock'
      ELSE 'in_stock'
    END
    WHERE name = v_product_name;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for stock synchronization
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();