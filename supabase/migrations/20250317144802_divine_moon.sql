/*
  # Fix Product Image URLs
  
  1. Changes
    - Update image URLs to use correct format
    - Remove any leading slashes
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'air-force1.png'
WHERE slug = 'nike-air-force-1';