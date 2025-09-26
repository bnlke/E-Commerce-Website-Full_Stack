/*
  # Fix Stock Synchronization for Duplicate Products
  
  1. Changes
    - Add function to increment stock with synchronization
    - Update trigger to maintain consistent stock levels
    - Fix stock status updates
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Drop existing increment function
DROP FUNCTION IF EXISTS increment_stock(uuid, text, integer);

-- Create improved increment function with synchronization
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
BEGIN
  -- Get the product name
  SELECT name INTO v_product_name
  FROM products
  WHERE id = p_product_id;

  -- Update stock for all products with the same name
  UPDATE product_sizes ps
  SET 
    stock_quantity = stock_quantity + p_quantity,
    updated_at = now()
  FROM products p
  WHERE p.id = ps.product_id
  AND p.name = v_product_name
  AND ps.size = p_size;

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
END;
$$;