/*
  # Improve Order Details Functions
  
  1. Changes
    - Update get_order_by_id function to include more detailed information
    - Add size information to order items
    - Improve order status handling
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_order_by_id(uuid);

-- Create improved function to get order by ID with more details
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
  payment_method_id uuid,
  payment_details jsonb,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.shipping_address_id,
    o.payment_method,
    o.payment_method_id,
    CASE 
      WHEN o.payment_method_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', pm.id,
            'card_type', pm.card_type,
            'last_four', pm.last_four,
            'expiry_date', pm.expiry_date,
            'cardholder_name', pm.cardholder_name
          )
          FROM payment_methods pm
          WHERE pm.id = o.payment_method_id
        )
      ELSE NULL
    END as payment_details,
    o.tracking_number,
    o.estimated_delivery,
    o.delivery_notes,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'size', COALESCE(cart.size, 'One Size'),
            'product', jsonb_build_object(
              'name', p.name,
              'image_url', p.image_url,
              'slug', p.slug,
              'description', p.description
            )
          )
        )
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN cart ON cart.product_id = oi.product_id AND cart.user_id = o.user_id
        WHERE oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items,
    CASE 
      WHEN o.shipping_address_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
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
          FROM user_addresses ua
          WHERE ua.id = o.shipping_address_id
        )
      ELSE NULL
    END as shipping_address
  FROM orders o
  WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR check_user_permission('admin'));
END;
$$;

-- Update get_user_orders function to include more details
DROP FUNCTION IF EXISTS get_user_orders();

CREATE OR REPLACE FUNCTION get_user_orders()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
  payment_method_id uuid,
  payment_details jsonb,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.shipping_address_id,
    o.payment_method,
    o.payment_method_id,
    CASE 
      WHEN o.payment_method_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
            'id', pm.id,
            'card_type', pm.card_type,
            'last_four', pm.last_four,
            'expiry_date', pm.expiry_date,
            'cardholder_name', pm.cardholder_name
          )
          FROM payment_methods pm
          WHERE pm.id = o.payment_method_id
        )
      ELSE NULL
    END as payment_details,
    o.tracking_number,
    o.estimated_delivery,
    o.delivery_notes,
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
    ) as items,
    CASE 
      WHEN o.shipping_address_id IS NOT NULL THEN
        (
          SELECT jsonb_build_object(
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
          FROM user_addresses ua
          WHERE ua.id = o.shipping_address_id
        )
      ELSE NULL
    END as shipping_address
  FROM orders o
  WHERE o.user_id = auth.uid()
  ORDER BY o.created_at DESC;
END;
$$;