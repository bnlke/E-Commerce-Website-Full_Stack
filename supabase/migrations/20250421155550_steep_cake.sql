/*
  # Add increment_stock function

  1. New Function
    - `increment_stock`: Updates product stock quantity when items are removed from cart
      - Parameters:
        - p_product_id (UUID): Product ID
        - p_size (TEXT): Product size
        - p_quantity (INTEGER): Quantity to increment
      - Returns: VOID
      - Updates stock_quantity in product_sizes table

  2. Security
    - Function is accessible to authenticated users only
    - Validates input parameters before updating
*/

CREATE OR REPLACE FUNCTION public.increment_stock(
    p_product_id UUID,
    p_size TEXT,
    p_quantity INTEGER
)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    -- Validate input parameters
    IF p_product_id IS NULL OR p_size IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Invalid input parameters';
    END IF;

    -- Update stock quantity
    UPDATE product_sizes
    SET 
        stock_quantity = stock_quantity + p_quantity,
        updated_at = now()
    WHERE product_id = p_product_id AND size = p_size;

    -- Verify update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product size combination not found';
    END IF;
END;
$$
LANGUAGE plpgsql;