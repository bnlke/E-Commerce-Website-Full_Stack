/*
  # Fix Product Image URLs
  
  1. Changes
    - Update image URLs to match actual filenames in storage
    - Add proper file extensions
    - Ensure consistent naming
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'air-force-1.webp'
WHERE slug = 'nike-air-force-1';

-- Update Nike Air Max 12 product image URL
UPDATE products
SET image_url = 'air-max-12.webp'
WHERE slug = 'nike-12';