/*
  # Fix Stock Synchronization
  
  1. Changes
    - Update increment_stock function to sync across same products
    - Add proper error handling and validation
    - Ensure consistent stock status updates
    - Fix stock restoration on cart removal
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Drop existing function
DROP FUNCTION IF EXISTS increment_stock(uuid, text, integer);

-- Create improved increment function with name-based synchronization
CREATE OR REPLACE FUNCTION increment_stock(
  p_product_id uuid,
  p_size text,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_name text;
  v_current_quantity integer;
BEGIN
  -- Get the product name for synchronization
  SELECT name INTO v_product_name
  FROM products
  WHERE id = p_product_id;

  IF v_product_name IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Get current quantity for validation
  SELECT stock_quantity INTO v_current_quantity
  FROM product_sizes
  WHERE product_id = p_product_id AND size = p_size;

  IF v_current_quantity IS NULL THEN
    RAISE EXCEPTION 'Size % not found for product %', p_size, p_product_id;
  END IF;

  -- Update stock for all products with the same name
  WITH updated_sizes AS (
    UPDATE product_sizes ps
    SET 
      stock_quantity = stock_quantity + p_quantity,
      updated_at = now()
    FROM products p
    WHERE p.id = ps.product_id
    AND p.name = v_product_name
    AND ps.size = p_size
    RETURNING ps.product_id, ps.stock_quantity
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
  WHERE name = v_product_name;

  -- Log the update for debugging
  RAISE NOTICE 'Stock synchronized for product name: %, size: %, quantity change: %',
    v_product_name, p_size, p_quantity;
END;
$$;

-- Update restore_stock_on_cart_delete function to use the synchronized increment_stock
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use increment_stock to ensure synchronization
  PERFORM increment_stock(
    OLD.product_id,
    OLD.size,
    OLD.quantity
  );
  
  RETURN OLD;
END;
$$;