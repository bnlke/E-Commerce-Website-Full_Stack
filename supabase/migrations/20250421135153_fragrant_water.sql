/*
  # Fix Stock Synchronization for Duplicate Products
  
  1. Changes
    - Add function to sync stock across products with same name
    - Update triggers to maintain consistent stock levels
    - Fix stock status updates
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Function to sync stock across products with same name
CREATE OR REPLACE FUNCTION sync_product_stock()
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
  WHERE id = NEW.product_id;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = NEW.stock_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = NEW.size
  AND ps.id != NEW.id;

  -- Update stock status for all related products
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
  WHERE name = v_product_name;

  RETURN NEW;
END;
$$;

-- Drop existing trigger
DROP TRIGGER IF EXISTS sync_product_stock_trigger ON product_sizes;

-- Create new trigger for stock synchronization
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();

-- Function to get synchronized stock status
CREATE OR REPLACE FUNCTION get_product_stock_status(p_product_id uuid)
RETURNS TABLE (
  size text,
  stock_quantity integer,
  status text
)
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
  WHERE id = p_product_id;

  RETURN QUERY
  SELECT DISTINCT ON (ps.size)
    ps.size,
    ps.stock_quantity,
    CASE
      WHEN ps.stock_quantity = 0 THEN 'out_of_stock'
      WHEN ps.stock_quantity <= 10 THEN 'low_stock'
      ELSE 'in_stock'
    END as status
  FROM product_sizes ps
  JOIN products p ON p.id = ps.product_id
  WHERE p.name = v_product_name
  ORDER BY ps.size, ps.updated_at DESC;
END;
$$;