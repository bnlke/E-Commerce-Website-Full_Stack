/*
  # Fix order management functions
  
  1. Changes
    - Drop existing functions first to avoid conflicts
    - Recreate get_user_orders() without parameters
    - Recreate get_order_by_id() with proper parameter
  
  2. Security
    - Functions are set as SECURITY DEFINER to run with elevated privileges
    - Access control is handled within the functions using auth.uid()
*/

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.get_user_orders(uuid);
DROP FUNCTION IF EXISTS public.get_user_orders();
DROP FUNCTION IF EXISTS public.get_order_by_id(uuid);

-- Function to get all orders for the current user (no parameters)
CREATE OR REPLACE FUNCTION public.get_user_orders()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
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

-- Function to get a specific order by ID
CREATE OR REPLACE FUNCTION public.get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric(10,2),
  created_at timestamptz,
  updated_at timestamptz,
  shipping_address_id uuid,
  payment_method text,
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
  WHERE o.id = p_order_id
    AND o.user_id = auth.uid();
END;
$$;