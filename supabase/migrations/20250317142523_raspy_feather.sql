/*
  # Update Product Image URLs
  
  1. Changes
    - Update image URLs to use correct storage paths
    - Ensure consistent image paths between products
*/

-- Update Nike Air Force 1 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/0.8820229318781949.webp'
WHERE slug = 'nike-air-force-1';

-- Update Nike Air Max 12 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/0.8820229318781949.webp'
WHERE slug = 'nike-12';