/*
  # Update Stock Management Function
  
  1. Changes
    - Add better error handling
    - Add transaction management
    - Add stock validation
    - Add logging
  
  2. Security
    - Maintains SECURITY DEFINER
    - Uses explicit schema references
*/

-- Drop existing function
DROP FUNCTION IF EXISTS update_stock_quantity(uuid, text, integer);

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION update_stock_quantity(
  p_product_id uuid,
  p_size text,
  p_quantity_change integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_quantity integer;
  v_new_quantity integer;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current stock with row lock
    SELECT stock_quantity INTO v_current_quantity
    FROM product_sizes
    WHERE product_id = p_product_id AND size = p_size
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Size % not found for product %', p_size, p_product_id;
    END IF;

    -- Calculate new quantity
    v_new_quantity := v_current_quantity + p_quantity_change;
    
    -- Prevent negative stock
    IF v_new_quantity < 0 THEN
      RAISE EXCEPTION 'Insufficient stock: current %, requested change %', v_current_quantity, p_quantity_change;
    END IF;

    -- Update stock quantity
    UPDATE product_sizes
    SET 
      stock_quantity = v_new_quantity,
      updated_at = now()
    WHERE product_id = p_product_id AND size = p_size;

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
    WHERE id = p_product_id;

    -- Log the update
    RAISE NOTICE 'Stock updated for product % size %: % -> %', 
      p_product_id, p_size, v_current_quantity, v_new_quantity;

    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error updating stock: %', SQLERRM;
      RETURN false;
  END;
END;
$$;