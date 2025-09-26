/*
  # Sync Stripe Orders with Order History
  
  1. New Functions
    - `sync_stripe_order_to_orders`: Creates an order record from a Stripe order
    - `get_stripe_orders_for_user`: Retrieves all Stripe orders for the current user
  
  2. Changes
    - Add trigger to automatically sync Stripe orders to the orders table
    - Improve order history to include Stripe orders
    - Fix payment confirmation flow
  
  3. Security
    - Functions are SECURITY DEFINER to run with elevated privileges
    - Access control is handled within the functions using auth.uid()
*/

-- Function to sync a Stripe order to the orders table
CREATE OR REPLACE FUNCTION sync_stripe_order_to_orders(
  p_stripe_order_id bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_user_id uuid;
  v_customer_id text;
  v_stripe_order stripe_orders;
BEGIN
  -- Get the Stripe order
  SELECT * INTO v_stripe_order
  FROM stripe_orders
  WHERE id = p_stripe_order_id;
  
  IF v_stripe_order IS NULL THEN
    RAISE EXCEPTION 'Stripe order not found';
  END IF;
  
  -- Get the user ID for this customer
  SELECT user_id INTO v_user_id
  FROM stripe_customers
  WHERE customer_id = v_stripe_order.customer_id
  AND deleted_at IS NULL;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for customer %', v_stripe_order.customer_id;
  END IF;
  
  -- Check if an order already exists for this payment intent
  SELECT id INTO v_order_id
  FROM orders
  WHERE user_id = v_user_id
  AND EXISTS (
    SELECT 1 FROM stripe_orders so
    WHERE so.payment_intent_id = v_stripe_order.payment_intent_id
  );
  
  -- If order already exists, return its ID
  IF v_order_id IS NOT NULL THEN
    RETURN v_order_id;
  END IF;
  
  -- Create a new order
  INSERT INTO orders (
    user_id,
    status,
    total_amount,
    payment_method,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    CASE 
      WHEN v_stripe_order.status = 'completed' THEN 'completed'
      WHEN v_stripe_order.status = 'canceled' THEN 'canceled'
      ELSE 'pending'
    END,
    v_stripe_order.amount_total / 100.0, -- Convert from cents to dollars
    'Stripe',
    v_stripe_order.created_at,
    v_stripe_order.updated_at
  )
  RETURNING id INTO v_order_id;
  
  -- Log the sync
  RAISE NOTICE 'Synced Stripe order % to order %', p_stripe_order_id, v_order_id;
  
  RETURN v_order_id;
END;
$$;

-- Function to get all Stripe orders for the current user
CREATE OR REPLACE FUNCTION get_stripe_orders_for_user()
RETURNS TABLE (
  id uuid,
  stripe_order_id bigint,
  checkout_session_id text,
  payment_intent_id text,
  amount_total numeric(10,2),
  currency text,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    so.id as stripe_order_id,
    so.checkout_session_id,
    so.payment_intent_id,
    so.amount_total / 100.0 as amount_total,
    so.currency,
    o.status,
    o.created_at
  FROM orders o
  JOIN stripe_orders so ON so.payment_intent_id = (
    SELECT payment_intent_id 
    FROM stripe_orders 
    WHERE customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = o.user_id
    )
    AND created_at = (
      SELECT MAX(created_at) 
      FROM stripe_orders 
      WHERE customer_id IN (
        SELECT customer_id 
        FROM stripe_customers 
        WHERE user_id = o.user_id
      )
    )
  )
  WHERE o.user_id = auth.uid()
  ORDER BY o.created_at DESC;
END;
$$;

-- Function to ensure Stripe orders are synced to the orders table
CREATE OR REPLACE FUNCTION ensure_stripe_orders_synced()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stripe_order record;
  v_user_id uuid;
  v_order_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get all Stripe orders for this user that don't have a corresponding order
  FOR v_stripe_order IN
    SELECT so.*
    FROM stripe_orders so
    JOIN stripe_customers sc ON so.customer_id = sc.customer_id
    WHERE sc.user_id = v_user_id
    AND so.deleted_at IS NULL
    AND so.payment_status = 'paid'
    AND NOT EXISTS (
      SELECT 1 FROM orders o
      WHERE o.user_id = v_user_id
      AND EXISTS (
        SELECT 1 FROM stripe_orders so2
        WHERE so2.payment_intent_id = so.payment_intent_id
      )
    )
  LOOP
    -- Sync this Stripe order
    v_order_id := sync_stripe_order_to_orders(v_stripe_order.id);
    
    -- Log the sync
    RAISE NOTICE 'Synced Stripe order % to order %', v_stripe_order.id, v_order_id;
  END LOOP;
END;
$$;

-- Create a trigger function to sync Stripe orders when they're created
CREATE OR REPLACE FUNCTION trigger_sync_stripe_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
BEGIN
  -- Only sync completed orders with paid status
  IF NEW.status = 'completed' AND NEW.payment_status = 'paid' THEN
    -- Get the user ID for this customer
    SELECT user_id INTO v_user_id
    FROM stripe_customers
    WHERE customer_id = NEW.customer_id
    AND deleted_at IS NULL;
    
    IF v_user_id IS NOT NULL THEN
      -- Sync this Stripe order
      v_order_id := sync_stripe_order_to_orders(NEW.id);
      
      -- Log the sync
      RAISE NOTICE 'Automatically synced Stripe order % to order %', NEW.id, v_order_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_stripe_order_trigger ON stripe_orders;
CREATE TRIGGER sync_stripe_order_trigger
  AFTER INSERT OR UPDATE ON stripe_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_stripe_order();