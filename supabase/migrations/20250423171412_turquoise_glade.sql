/*
  # Add Tracking Columns to Orders Table
  
  1. Changes
    - Add tracking_number column to orders table
    - Add estimated_delivery column to orders table
    - Add delivery_notes column to orders table
  
  2. Security
    - No changes to security model
*/

-- Add tracking number and related columns to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
  ) THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_notes text;
  END IF;
END $$;