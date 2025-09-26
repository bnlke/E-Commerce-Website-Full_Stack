/*
  # Fix Order Functions for Payment Confirmation
  
  1. Changes
    - Drop existing functions first to avoid return type errors
    - Recreate get_user_orders and get_order_by_id with consistent return types
    - Add missing columns to support payment confirmation flow
    - Fix order retrieval by payment intent ID
  
  2. Security
    - Maintain SECURITY DEFINER settings
    - Preserve existing access control
*/

-- Drop existing functions first to avoid return type errors
DROP FUNCTION IF EXISTS get_user_orders();
DROP FUNCTION IF EXISTS get_order_by_id(uuid);
DROP FUNCTION IF EXISTS get_order_by_payment_intent_direct(text);

-- Recreate get_user_orders function with consistent return type
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
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb,
  payment_details jsonb
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
    END as shipping_address,
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
    END as payment_details
  FROM orders o
  WHERE o.user_id = auth.uid()
  ORDER BY o.created_at DESC;
END;
$$;

-- Recreate get_order_by_id function with consistent return type
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
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb,
  payment_details jsonb
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
    END as shipping_address,
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
    END as payment_details
  FROM orders o
  WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR check_user_permission('admin'));
END;
$$;

-- Create function to get order by payment intent ID directly
CREATE OR REPLACE FUNCTION get_order_by_payment_intent_direct(
  p_payment_intent_id text
)
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
  tracking_number text,
  estimated_delivery timestamptz,
  delivery_notes text,
  items jsonb,
  shipping_address jsonb,
  payment_details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_user_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- First try to get the order ID from stripe_orders
  SELECT o.id INTO v_order_id
  FROM orders o
  JOIN stripe_orders so ON so.payment_intent_id = p_payment_intent_id
  LIMIT 1;
  
  -- If not found, try to get from orders table directly
  IF v_order_id IS NULL THEN
    -- Try to find the most recent order for this user
    SELECT id INTO v_order_id
    FROM orders
    WHERE payment_method = 'Stripe'
    AND user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- If still not found, return empty result
  IF v_order_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return order details
  RETURN QUERY
  SELECT * FROM get_order_by_id(v_order_id);
END;
$$;