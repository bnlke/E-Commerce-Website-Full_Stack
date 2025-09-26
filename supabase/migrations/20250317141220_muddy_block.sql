/*
  # Add Nike 12 Product with Stock Management
  
  1. Changes
    - Add Nike 12 product to database
    - Set up sizes and stock quantities
    - Configure stock status
  
  2. Security
    - Maintains existing RLS policies
*/

-- Insert Nike 12 product
INSERT INTO products (
  name,
  description,
  price,
  slug,
  image_url,
  stock_status,
  category_id
) VALUES (
  'Nike 12',
  'White color, resistant shoes',
  129.99,
  'nike-12',
  'https://via.placeholder.com/800x800',
  'in_stock',
  (SELECT id FROM product_categories WHERE name = 'Men''s Trainers' LIMIT 1)
) ON CONFLICT (slug) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category_id = EXCLUDED.category_id;

-- The trigger setup_product_sizes_trigger will automatically:
-- 1. Add appropriate sizes (40-46 for men's shoes)
-- 2. Set random initial stock quantities
-- 3. Update the product's stock status