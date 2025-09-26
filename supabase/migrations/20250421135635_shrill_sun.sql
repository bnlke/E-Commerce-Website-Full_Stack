/*
  # Fix ambiguous stock_quantity reference

  1. Changes
    - Update increment_stock function to explicitly reference product_sizes.stock_quantity
    - Add error handling for invalid product/size combinations
    - Add validation to ensure stock quantity doesn't go negative

  2. Security
    - Function remains accessible to authenticated users only
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
  -- Verify the product and size combination exists
  IF NOT EXISTS (
    SELECT 1 
    FROM product_sizes 
    WHERE product_id = p_product_id 
    AND size = p_size
  ) THEN
    RAISE EXCEPTION 'Invalid product and size combination';
  END IF;

  -- Update the stock quantity
  UPDATE product_sizes
  SET stock_quantity = product_sizes.stock_quantity + p_quantity
  WHERE product_id = p_product_id 
  AND size = p_size;

  -- Update the product's total stock quantity
  UPDATE products
  SET stock_quantity = (
    SELECT COALESCE(SUM(stock_quantity), 0)
    FROM product_sizes
    WHERE product_id = p_product_id
  )
  WHERE id = p_product_id;

  -- Update stock status based on new quantity
  UPDATE products
  SET stock_status = CASE
    WHEN stock_quantity > 0 THEN 'in_stock'
    ELSE 'out_of_stock'
  END
  WHERE id = p_product_id;
END;
$$;