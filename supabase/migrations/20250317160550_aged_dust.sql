/*
  # Fix Product Image URLs
  
  1. Changes
    - Update image URLs to use correct paths
    - Remove double slashes
    - Update trigger to handle URL formatting
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS process_product_image_trigger ON products;

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/airforce1.png'
WHERE slug = 'nike-air-force-1';

-- Update Nike Air Max 12 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/airmax12.webp'
WHERE slug = 'nike-12';

-- Create function to validate and process image URLs
CREATE OR REPLACE FUNCTION process_product_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure image_url is properly formatted
  IF NEW.image_url IS NOT NULL THEN
    -- Remove any double slashes (except in https://)
    NEW.image_url := regexp_replace(NEW.image_url, '(?<!:)/+', '/', 'g');
    
    -- If URL doesn't start with https://, add the storage URL prefix
    IF NEW.image_url NOT LIKE 'https://%' THEN
      NEW.image_url := 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/' || ltrim(NEW.image_url, '/');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for image processing
CREATE TRIGGER process_product_image_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION process_product_image();

-- Update existing products to apply new image URLs
UPDATE products
SET updated_at = now()
WHERE id IN (
  SELECT id FROM products
);