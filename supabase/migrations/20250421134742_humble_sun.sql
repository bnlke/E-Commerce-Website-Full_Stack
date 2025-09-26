/*
  # Fix Stock Update Stack Depth Error
  
  1. Changes
    - Remove recursive triggers
    - Simplify stock update logic
    - Add direct stock management functions
    
  2. Security
    - Maintain RLS policies
    - Keep security checks
*/

-- Drop existing triggers that may cause recursion
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;

-- Create simpler function to sync product stock
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update product status based on total stock
  UPDATE products
  SET stock_status = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = NEW.product_id
      AND ps.stock_quantity > 0
    ) THEN 'out_of_stock'
    WHEN EXISTS (
      SELECT 1 FROM product_sizes ps
      WHERE ps.product_id = NEW.product_id
      AND ps.stock_quantity <= 10
    ) THEN 'low_stock'
    ELSE 'in_stock'
  END
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- Create simpler function to restore stock
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Directly update stock quantity
  UPDATE product_sizes
  SET stock_quantity = stock_quantity + OLD.quantity
  WHERE product_id = OLD.product_id
  AND size = OLD.size;

  RETURN OLD;
END;
$$;

-- Recreate triggers with simplified functions
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();

CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();