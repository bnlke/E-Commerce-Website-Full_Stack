/*
  # Fix Stock Doubling Issue
  
  1. Changes
    - Drop existing triggers
    - Update restore_stock_on_cart_delete to handle stock directly
    - Remove sync trigger to prevent double updates
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;

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
  SELECT MIN(stock_quantity) INTO v_current_quantity
  FROM product_sizes ps
  JOIN products p ON p.id = ps.product_id
  WHERE p.name = v_product_name
  AND ps.size = OLD.size;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + OLD.quantity;

  -- Update stock for all products with the same name in a single transaction
  UPDATE product_sizes ps
  SET 
    stock_quantity = v_new_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = OLD.size;

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
  WHERE name = v_product_name;

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