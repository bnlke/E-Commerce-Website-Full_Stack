/*
  # Add tracking number to orders table and fix functions

  1. Changes
    - Add tracking_number column to orders table
    - Add estimated_delivery column to orders table
    - Add delivery_notes column to orders table
    - Drop and recreate functions with updated return types

  2. Purpose
    - Enable order tracking functionality
    - Support delivery date estimation
    - Allow for delivery-specific notes
*/

-- Add tracking number and related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS estimated_delivery timestamptz,
ADD COLUMN IF NOT EXISTS delivery_notes text;

-- Drop existing functions first to avoid return type errors
DROP FUNCTION IF EXISTS get_user_orders();
DROP FUNCTION IF EXISTS get_order_by_id(uuid);

-- Recreate the get_user_orders function with new fields
CREATE OR REPLACE FUNCTION get_user_orders()
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric,
  created_at timestamptz,
  updated_at timestamptz,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  payment_method text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.tracking_number,
    o.estimated_delivery,
    o.delivery_notes,
    COALESCE(
      jsonb_agg(
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
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::jsonb
    ) as items,
    o.payment_method
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN products p ON oi.product_id = p.id
  WHERE o.user_id = auth.uid()
  GROUP BY o.id
  ORDER BY o.created_at DESC;
END;
$$;

-- Recreate the get_order_by_id function with new fields
CREATE OR REPLACE FUNCTION get_order_by_id(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  status text,
  total_amount numeric,
  created_at timestamptz,
  updated_at timestamptz,
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  payment_method text,
  payment_details jsonb,
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
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.tracking_number,
    o.estimated_delivery,
    o.delivery_notes,
    COALESCE(
      jsonb_agg(
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
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::jsonb
    ) as items,
    o.payment_method,
    CASE 
      WHEN pm.id IS NOT NULL THEN
        jsonb_build_object(
          'id', pm.id,
          'card_type', pm.card_type,
          'last_four', pm.last_four,
          'expiry_date', pm.expiry_date,
          'cardholder_name', pm.cardholder_name
        )
      ELSE NULL
    END as payment_details,
    CASE 
      WHEN ua.id IS NOT NULL THEN
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
      ELSE NULL
    END as shipping_address
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  LEFT JOIN products p ON oi.product_id = p.id
  LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
  LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.id
  WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR check_user_permission('admin'))
  GROUP BY 
    o.id,
    pm.id,
    pm.card_type,
    pm.last_four,
    pm.expiry_date,
    pm.cardholder_name,
    ua.id,
    ua.name,
    ua.address_line1,
    ua.address_line2,
    ua.city,
    ua.state,
    ua.postal_code,
    ua.country,
    ua.phone;
END;
$$;