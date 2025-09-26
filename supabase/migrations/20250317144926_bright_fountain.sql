/*
  # Fix Nike Air Force 1 Image URL
  
  1. Changes
    - Update image URL to use correct format without spaces
    - Ensure proper URL encoding
  
  2. Security
    - No security changes needed
*/

-- Update Nike Air Force 1 product image URL with properly formatted name
UPDATE products
SET image_url = 'air-force-1.png'
WHERE slug = 'nike-air-force-1';