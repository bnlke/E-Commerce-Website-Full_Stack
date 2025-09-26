/*
  # Fix Stock Increment Function
  
  1. Changes
    - Update increment_stock to restore original quantity
    - Add proper locking to prevent race conditions
    - Fix stock synchronization across views
  
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
    v_product_name text;
    v_original_quantity integer;
BEGIN
    -- Validate input parameters
    IF p_product_id IS NULL OR p_size IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Invalid input parameters';
    END IF;

    -- Get the product name
    SELECT name INTO v_product_name
    FROM products
    WHERE id = p_product_id;

    IF v_product_name IS NULL THEN
        RAISE EXCEPTION 'Product not found';
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

    -- Update stock for all products with the same name to restore original quantity
    UPDATE product_sizes ps
    SET 
        stock_quantity = v_original_quantity + p_quantity,
        updated_at = now()
    FROM products p
    WHERE p.id = ps.product_id
    AND p.name = v_product_name
    AND ps.size = p_size;

    -- Update stock status
    UPDATE products p
    SET stock_status = CASE
        WHEN (v_original_quantity + p_quantity) = 0 THEN 'out_of_stock'
        WHEN (v_original_quantity + p_quantity) <= 10 THEN 'low_stock'
        ELSE 'in_stock'
    END
    WHERE name = v_product_name;

    -- Log the update
    RAISE NOTICE 'Stock restored for product %, size %: % -> %',
        v_product_name, p_size, v_original_quantity, v_original_quantity + p_quantity;
END;
$$
LANGUAGE plpgsql;