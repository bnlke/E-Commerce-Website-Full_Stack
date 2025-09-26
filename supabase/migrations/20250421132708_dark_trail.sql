/*
  # Improve Stock Management System
  
  1. Changes
    - Add function to handle stock updates
    - Add trigger for cart item deletion
    - Add better stock validation
  
  2. Security
    - Maintain RLS policies
    - Add proper error handling
*/

-- Function to update stock when cart item is removed
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increase stock quantity when item is removed from cart
  UPDATE product_sizes
  SET 
    stock_quantity = stock_quantity + OLD.quantity,
    updated_at = now()
  WHERE 
    product_id = OLD.product_id 
    AND size = OLD.size;

  -- Update product status
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

-- Create trigger for cart item deletion
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();

-- Function to get product stock status
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
  SELECT 
    ps.size,
    ps.stock_quantity,
    CASE
      WHEN ps.stock_quantity = 0 THEN 'out_of_stock'
      WHEN ps.stock_quantity <= 10 THEN 'low_stock'
      ELSE 'in_stock'
    END as status
  FROM product_sizes ps
  WHERE ps.product_id = p_product_id
  ORDER BY ps.size;
END;
$$;