/*
  # Fix Stock Restoration on Cart Removal
  
  1. Changes
    - Update restore_stock_on_cart_delete function to handle stock properly
    - Ensure stock is restored only for the specific product
    - Add better error handling and validation
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
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
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = OLD.product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Update stock only for the specific product
  UPDATE product_sizes ps
  SET 
    stock_quantity = ps.stock_quantity + OLD.quantity,
    updated_at = now()
  WHERE ps.product_id = OLD.product_id
  AND ps.size = OLD.size;

  -- Update stock status
  UPDATE products p
  SET stock_status = CASE
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
  WHERE id = OLD.product_id;

  RETURN OLD;
END;
$$;

-- Recreate trigger
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();