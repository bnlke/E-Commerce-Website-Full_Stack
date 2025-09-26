/*
  # Fix Stock Synchronization
  
  1. Changes
    - Drop existing triggers and functions
    - Add transaction-based stock handling
    - Fix stock synchronization across views
    - Prevent stock doubling
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

-- Function to sync stock status
CREATE OR REPLACE FUNCTION sync_stock_status(p_product_name text, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET stock_status = CASE
    WHEN p_quantity = 0 THEN 'out_of_stock'
    WHEN p_quantity <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
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
  v_primary_id uuid;
  v_original_quantity integer;
BEGIN
  -- Start transaction
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

    -- Get original quantity from primary product
    SELECT stock_quantity INTO v_original_quantity
    FROM product_sizes
    WHERE product_id = v_primary_id
    AND size = OLD.size
    FOR UPDATE;

    -- Update stock for all products with the same name
    UPDATE product_sizes ps
    SET 
      stock_quantity = v_original_quantity + OLD.quantity,
      updated_at = now()
    FROM products p
    WHERE p.id = ps.product_id
    AND p.name = v_product_name
    AND ps.size = OLD.size;

    -- Sync stock status
    PERFORM sync_stock_status(v_product_name, v_original_quantity + OLD.quantity);

    -- Log the update
    RAISE NOTICE 'Stock restored for product % (primary ID: %), size %: % -> %',
      v_product_name, v_primary_id, OLD.size, v_original_quantity, v_original_quantity + OLD.quantity;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in restore_stock_on_cart_delete: %', SQLERRM;
      RAISE;
  END;

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
  -- Start transaction
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

    -- Only proceed with sync if this is the primary product
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

      -- Sync stock status
      PERFORM sync_stock_status(v_product_name, NEW.stock_quantity);
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error in sync_product_stock: %', SQLERRM;
      RAISE;
  END;

  RETURN NEW;
END;
$$;

-- Create trigger for stock synchronization
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();