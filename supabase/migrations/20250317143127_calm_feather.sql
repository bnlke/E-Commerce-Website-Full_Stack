/*
  # Update Nike Air Force 1 Image URL

  1. Changes
    - Update image_url to use air-force1.png from Supabase storage
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/air-force1.png'
WHERE slug = 'nike-air-force-1';