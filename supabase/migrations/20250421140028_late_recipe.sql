/*
  # Fix stock quantity ambiguity

  1. Changes
    - Update increment_stock function to explicitly reference product_sizes table
    - Add proper error handling and validation
    - Ensure atomic updates

  2. Security
    - Maintain existing RLS policies
    - Function remains security definer for proper access control
*/

CREATE OR REPLACE FUNCTION increment_stock(
  p_product_id UUID,
  p_size TEXT,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  -- Update stock in product_sizes table
  UPDATE product_sizes
  SET stock_quantity = product_sizes.stock_quantity + p_quantity
  WHERE product_id = p_product_id AND size = p_size;

  -- If no rows were updated, the product size combination doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product size combination not found';
  END IF;

  -- Update the total stock in products table
  UPDATE products p
  SET stock_quantity = (
    SELECT COALESCE(SUM(ps.stock_quantity), 0)
    FROM product_sizes ps
    WHERE ps.product_id = p.id
  )
  WHERE id = p_product_id;
END;
$$;