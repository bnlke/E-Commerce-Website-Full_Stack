/*
  # Fix Product Image URLs
  
  1. Changes
    - Update image URLs to use correct filenames
    - Ensure consistent URL format
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'air-force1.png'
WHERE slug = 'nike-air-force-1';

-- Update Nike Air Max 12 product image URL 
UPDATE products
SET image_url = 'airmax12.webp'
WHERE slug = 'nike-12';