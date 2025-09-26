/*
  # Add payment_method column to orders table

  1. Changes
    - Add payment_method column to orders table
    - Set default value to 'card'
    - Make column nullable
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders 
    ADD COLUMN payment_method text DEFAULT 'card';
  END IF;
END $$;