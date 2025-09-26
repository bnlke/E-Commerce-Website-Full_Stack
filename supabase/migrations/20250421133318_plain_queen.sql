/*
  # Fix Stock Restoration on Cart Delete
  
  1. Changes
    - Update restore_stock_on_cart_delete function to properly handle stock restoration
    - Add better error handling and logging
    - Fix stock status updates
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;

-- Update function to properly restore stock
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_quantity integer;
  v_new_quantity integer;
BEGIN
  -- Get current stock quantity with row lock
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = OLD.product_id AND size = OLD.size
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Size % not found for product %', OLD.size, OLD.product_id;
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + OLD.quantity;

  -- Update stock quantity
  UPDATE product_sizes
  SET 
    stock_quantity = v_new_quantity,
    updated_at = now()
  WHERE product_id = OLD.product_id AND size = OLD.size;

  -- Update product status
  WITH size_stats AS (
    SELECT 
      MIN(stock_quantity) as min_stock,
      MAX(stock_quantity) as max_stock
    FROM product_sizes
    WHERE product_id = OLD.product_id
  )
  UPDATE products p
  SET stock_status = CASE
    WHEN s.min_stock = 0 THEN 'out_of_stock'
    WHEN s.max_stock <= 10 THEN 'low_stock'
    ELSE 'in_stock'
  END
  FROM size_stats s
  WHERE p.id = OLD.product_id;

  -- Log the stock restoration
  RAISE NOTICE 'Stock restored for product % size %: % -> %', 
    OLD.product_id, OLD.size, v_current_quantity, v_new_quantity;

  RETURN OLD;
END;
$$;

-- Recreate trigger
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();