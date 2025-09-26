/*
  # Fix Stock Synchronization
  
  1. Changes
    - Update restore_stock_on_cart_delete to handle stock sync properly
    - Add better error handling and logging
    - Fix stock restoration for same products across categories
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;

-- Create improved function to restore stock
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_current_quantity integer;
  v_new_quantity integer;
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get current quantity for logging
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = OLD.product_id
  AND size = OLD.size;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + OLD.quantity;

  -- Update stock for all products with the same name
  WITH updated_sizes AS (
    UPDATE product_sizes ps
    SET 
      stock_quantity = ps.stock_quantity + OLD.quantity,
      updated_at = now()
    FROM products p
    WHERE p.id = ps.product_id
    AND p.name = v_product_name
    AND ps.size = OLD.size
    RETURNING ps.product_id
  )
  -- Update stock status for all related products
  UPDATE products p
  SET stock_status = (
    SELECT 
      CASE
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
  )
  WHERE p.name = v_product_name;

  -- Log the update
  RAISE NOTICE 'Stock restored for product %, size %: % -> %',
    v_product_name, OLD.size, v_current_quantity, v_new_quantity;

  RETURN OLD;
END;
$$;

-- Create trigger for stock restoration
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();