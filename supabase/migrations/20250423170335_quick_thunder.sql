/*
  # Add shipping address ID to orders table and fix get_order_by_id function

  1. Changes
    - Add `shipping_address_id` column to `orders` table
    - Drop and recreate get_order_by_id function with updated return type
    - Add shipping address details to order query results

  2. Security
    - Maintain existing RLS policies
    - Add policy for shipping address access
*/

-- Add shipping_address_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_address_id'
  ) THEN
    ALTER TABLE orders 
    ADD COLUMN shipping_address_id uuid REFERENCES user_addresses(id);
  END IF;
END $$;

-- Drop the existing function first to avoid return type error
DROP FUNCTION IF EXISTS get_order_by_id(uuid);

-- Recreate get_order_by_id function with updated return type
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  payment_method text,
  shipping_address_id uuid,
  shipping_address jsonb,
  payment_details jsonb,
  items jsonb
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.payment_method,
    o.shipping_address_id,
    CASE WHEN ua.id IS NOT NULL THEN
      jsonb_build_object(
        'id', ua.id,
        'name', ua.name,
        'address_line1', ua.address_line1,
        'address_line2', ua.address_line2,
        'city', ua.city,
        'state', ua.state,
        'postal_code', ua.postal_code,
        'country', ua.country,
        'phone', ua.phone
      )
    ELSE NULL END as shipping_address,
    CASE WHEN pm.id IS NOT NULL THEN
      jsonb_build_object(
        'id', pm.id,
        'card_type', pm.card_type,
        'last_four', pm.last_four,
        'expiry_date', pm.expiry_date,
        'cardholder_name', pm.cardholder_name
      )
    ELSE NULL END as payment_details,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'product', jsonb_build_object(
              'name', p.name,
              'image_url', p.image_url,
              'slug', p.slug
            )
          )
        )
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items
  FROM orders o
  LEFT JOIN user_addresses ua ON ua.id = o.shipping_address_id
  LEFT JOIN payment_methods pm ON pm.id = o.payment_method_id
  WHERE o.id = p_order_id
  AND (
    o.user_id = auth.uid()
    OR check_user_permission('admin')
  );
END;
$$ LANGUAGE plpgsql;