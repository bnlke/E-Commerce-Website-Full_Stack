/*
  # Fix Stock Increment Function
  
  1. Changes
    - Update increment_stock to use product ID instead of name
    - Restore original quantity instead of incrementing
    - Add proper locking to prevent race conditions
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

CREATE OR REPLACE FUNCTION public.increment_stock(
    p_product_id UUID,
    p_size TEXT,
    p_quantity INTEGER
)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_original_quantity integer;
BEGIN
    -- Validate input parameters
    IF p_product_id IS NULL OR p_size IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Invalid input parameters';
    END IF;

    -- Get original quantity with lock
    SELECT stock_quantity INTO v_original_quantity
    FROM product_sizes
    WHERE product_id = p_product_id
    AND size = p_size
    FOR UPDATE;

    IF v_original_quantity IS NULL THEN
        RAISE EXCEPTION 'Product size combination not found';
    END IF;

    -- Update stock to restore original quantity
    UPDATE product_sizes
    SET 
        stock_quantity = v_original_quantity,
        updated_at = now()
    WHERE product_id = p_product_id
    AND size = p_size;

    -- Update stock status
    UPDATE products
    SET stock_status = CASE
        WHEN v_original_quantity = 0 THEN 'out_of_stock'
        WHEN v_original_quantity <= 10 THEN 'low_stock'
        ELSE 'in_stock'
    END
    WHERE id = p_product_id;

    -- Log the update
    RAISE NOTICE 'Stock restored for product ID %, size % to original quantity: %',
        p_product_id, p_size, v_original_quantity;
END;
$$
LANGUAGE plpgsql;