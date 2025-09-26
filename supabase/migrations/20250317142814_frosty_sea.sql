/*
  # Update Nike Air Max 12 Product Image URL
  
  1. Changes
    - Update image URL to use full Supabase storage URL
*/

-- Update Nike Air Max 12 product image URL
UPDATE products
SET image_url = 'https://pjwxxzcppvpgvkytjvpu.supabase.co/storage/v1/object/public/products/0.8820229318781949.webp'
WHERE slug = 'nike-12';