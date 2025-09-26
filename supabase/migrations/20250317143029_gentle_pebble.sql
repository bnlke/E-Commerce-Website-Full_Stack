/*
  # Update Product Image URLs

  1. Changes
    - Update Nike Air Force 1 to use air-force1.png
    - Update Nike Air Max 12 to use airmax12.webp
    - Use full Supabase storage URLs
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/air-force1.png'
WHERE slug = 'nike-air-force-1';

-- Update Nike Air Max 12 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/airmax12.webp'
WHERE slug = 'nike-12';