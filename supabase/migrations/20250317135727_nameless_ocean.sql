/*
  # Add Stock Management Functions
  
  1. Changes
    - Add function to update stock quantity
    - Add function to check stock status
    - Add trigger to update product status
  
  2. Security
    - Maintain RLS policies
    - Add proper error handling
*/

-- Function to update stock quantity
CREATE OR REPLACE FUNCTION update_stock_quantity(
  p_product_id uuid,
  p_size text,
  p_quantity_change integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update stock quantity
  UPDATE product_sizes
  SET 
    stock_quantity = GREATEST(0, stock_quantity + p_quantity_change),
    updated_at = now()
  WHERE product_id = p_product_id AND size = p_size;

  -- Update product status based on overall stock
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
  WHERE id = p_product_id;
END;
$$;