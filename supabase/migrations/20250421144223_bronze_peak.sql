-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;
DROP FUNCTION IF EXISTS get_primary_product_id;
DROP FUNCTION IF EXISTS sync_product_stock;
DROP FUNCTION IF EXISTS restore_stock_on_cart_delete;

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
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get current quantity with lock
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = OLD.product_id
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

  -- Update stock status
  UPDATE products p
  SET stock_status = CASE
    WHEN (v_current_quantity + OLD.quantity) = 0 THEN 'out_of_stock'
    WHEN (v_current_quantity + OLD.quantity) <= 10 THEN 'low_stock'
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