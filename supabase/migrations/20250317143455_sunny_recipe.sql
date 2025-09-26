/*
  # Update Product Image URLs
  
  1. Changes
    - Update image URLs to use relative paths
    - Remove full URLs to use storage paths instead
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'air-force1.png'
WHERE slug = 'nike-air-force-1';

-- Update Nike Air Max 12 product image URL
UPDATE products
SET image_url = 'airmax12.webp'
WHERE slug = 'nike-12';