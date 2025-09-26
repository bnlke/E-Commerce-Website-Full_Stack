/*
  # Add Additional Shoe Sizes
  
  1. Changes
    - Add sizes 40-46 for Nike Air Force 1
    - Update existing sizes with proper stock quantities
  
  2. Security
    - Maintains existing RLS policies
*/

DO $$
DECLARE
  v_product_id uuid;
BEGIN
  -- Get product ID
  SELECT get_product_id_by_slug('nike-air-force-1') INTO v_product_id;
  
  -- Insert or update sizes with initial stock
  INSERT INTO product_sizes (product_id, size, stock_quantity) VALUES
    (v_product_id, '40', 10),
    (v_product_id, '41', 15),
    (v_product_id, '42', 20),
    (v_product_id, '43', 20),
    (v_product_id, '44', 15),
    (v_product_id, '45', 10),
    (v_product_id, '46', 5)
  ON CONFLICT (product_id, size) 
  DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;
END;
$$;