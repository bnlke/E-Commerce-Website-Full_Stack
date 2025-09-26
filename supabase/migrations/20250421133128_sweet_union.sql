/*
  # Fix Cart Stock Management
  
  1. Changes
    - Create cart table to track items properly
    - Add constraints and RLS policies
    - Add trigger for stock management
    - Fix stock restoration on cart item removal
*/

-- Create cart table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  product_id uuid REFERENCES products ON DELETE CASCADE NOT NULL,
  size text NOT NULL,
  quantity integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT cart_quantity_check CHECK (quantity > 0)
);

-- Enable RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cart_user_idx ON cart(user_id);
CREATE INDEX IF NOT EXISTS cart_product_idx ON cart(product_id);

-- Function to restore stock when cart item is removed
CREATE OR REPLACE FUNCTION restore_stock_on_cart_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update stock quantity
  PERFORM update_stock_quantity(
    OLD.product_id,
    OLD.size,
    OLD.quantity  -- Add back the quantity that was in cart
  );
  
  RETURN OLD;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS restore_stock_on_cart_delete_trigger ON cart;

-- Create trigger for cart item deletion
CREATE TRIGGER restore_stock_on_cart_delete_trigger
  AFTER DELETE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION restore_stock_on_cart_delete();

-- Function to update stock quantity with better error handling
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

  RETURN true;
END;
$$;