/*
  # Update Nike Air Max 12 Image
  
  1. Changes
    - Update image_url to use the correct filename
*/

-- Update Nike Air Max 12 product with correct image filename
UPDATE products
SET image_url = '0.8820229318781949.webp'
WHERE slug = 'nike-12';