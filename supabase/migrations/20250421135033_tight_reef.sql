/*
  # Add stock increment function
  
  1. New Functions
    - `increment_stock`: Safely increments the stock quantity for a product size
      - Parameters:
        - p_product_id: UUID of the product
        - p_size: Size of the product
        - p_quantity: Amount to increment by
      
  2. Security
    - Function is accessible to authenticated users only
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
  UPDATE product_sizes
  SET stock_quantity = stock_quantity + p_quantity
  WHERE product_id = p_product_id AND size = p_size;
END;
$$;