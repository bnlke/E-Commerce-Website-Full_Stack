/*
  # Fix Product Stock Synchronization
  
  1. Changes
    - Add function to sync stock quantities across product views
    - Add trigger to maintain stock consistency
    - Update existing stock management functions
*/

-- Function to sync product stock quantities
CREATE OR REPLACE FUNCTION sync_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all related product sizes
  UPDATE product_sizes
  SET 
    stock_quantity = NEW.stock_quantity,
    updated_at = now()
  WHERE 
    product_id IN (
      SELECT p2.id 
      FROM products p1
      JOIN products p2 ON p1.name = p2.name 
      WHERE p1.id = NEW.product_id
    )
    AND size = NEW.size;

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
  WHERE id IN (
    SELECT p2.id 
    FROM products p1
    JOIN products p2 ON p1.name = p2.name 
    WHERE p1.id = NEW.product_id
  );

  RETURN NEW;
END;
$$;

-- Create trigger for stock synchronization
CREATE TRIGGER sync_product_stock_trigger
  AFTER UPDATE OF stock_quantity ON product_sizes
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_stock();

-- Update existing stock update function to handle synchronization
CREATE OR REPLACE FUNCTION update_stock_quantity(
  p_product_id uuid,
  p_size text,
  p_quantity_change integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_quantity integer;
  v_new_quantity integer;
BEGIN
  -- Get current stock with row lock
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = p_product_id AND size = p_size
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Size % not found for product %', p_size, p_product_id;
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + p_quantity_change;
  
  -- Prevent negative stock
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock: current %, requested change %', v_current_quantity, p_quantity_change;
  END IF;

  -- Update stock quantity (will trigger sync_product_stock_trigger)
  UPDATE product_sizes
  SET 
    stock_quantity = v_new_quantity,
    updated_at = now()
  WHERE product_id = p_product_id AND size = p_size;

  RETURN true;
END;
$$;

-- Function to get product stock status with related products
CREATE OR REPLACE FUNCTION get_product_stock_status(p_product_id uuid)
RETURNS TABLE (
  size text,
  stock_quantity integer,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH related_products AS (
    SELECT p2.id
    FROM products p1
    JOIN products p2 ON p1.name = p2.name
    WHERE p1.id = p_product_id
  )
  SELECT DISTINCT ON (ps.size)
    ps.size,
    ps.stock_quantity,
    CASE
      WHEN ps.stock_quantity = 0 THEN 'out_of_stock'
      WHEN ps.stock_quantity <= 10 THEN 'low_stock'
      ELSE 'in_stock'
    END as status
  FROM product_sizes ps
  WHERE ps.product_id IN (SELECT id FROM related_products)
  ORDER BY ps.size, ps.updated_at DESC;
END;
$$;