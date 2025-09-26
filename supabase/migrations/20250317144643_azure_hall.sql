/*
  # Fix Air Force 1 Image URL
  
  1. Changes
    - Update image URL to use correct format with double slash
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = '//air force1.png'
WHERE slug = 'nike-air-force-1';