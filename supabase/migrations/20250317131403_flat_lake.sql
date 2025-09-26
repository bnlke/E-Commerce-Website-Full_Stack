/*
  # Update Product Categories

  1. Changes
    - Create temporary categories table
    - Migrate existing categories
    - Update product references
    - Replace old categories with new ones

  2. New Categories
    - Men's Categories:
      - Trainers
      - Active Shoes
      - Water-Repellent
      - Casual Shoes
      - Hiking Boots
    - Women's Categories:
      - Trainers
      - Active Wear
      - Casual Shoes
      - Flats
      - Running Shoes
      - Lifestyle
    - Kids' Categories:
      - Trainers
      - Active Sneakers
      - School Shoes
*/

-- Create temporary categories table
CREATE TABLE temp_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES temp_categories(id),
  created_at timestamptz DEFAULT now()
);

-- Insert main category groups
INSERT INTO temp_categories (id, name, description, parent_id) VALUES
  ('c0a8f9b0-0000-4000-8000-000000000001', 'Men''s', 'All men''s footwear', NULL),
  ('c0a8f9b0-0000-4000-8000-000000000002', 'Women''s', 'All women''s footwear', NULL),
  ('c0a8f9b0-0000-4000-8000-000000000003', 'Kids''', 'All kids'' footwear', NULL);

-- Insert men's subcategories
INSERT INTO temp_categories (name, description, parent_id) VALUES
  ('Men''s Trainers', 'Comfortable everyday trainers for men', 'c0a8f9b0-0000-4000-8000-000000000001'),
  ('Men''s Active Shoes', 'Performance shoes for active lifestyles', 'c0a8f9b0-0000-4000-8000-000000000001'),
  ('Men''s Water-Repellent', 'Water-resistant footwear for any weather', 'c0a8f9b0-0000-4000-8000-000000000001'),
  ('Men''s Casual Shoes', 'Casual and comfortable everyday shoes', 'c0a8f9b0-0000-4000-8000-000000000001'),
  ('Men''s Hiking Boots', 'Durable boots for outdoor adventures', 'c0a8f9b0-0000-4000-8000-000000000001');

-- Insert women's subcategories
INSERT INTO temp_categories (name, description, parent_id) VALUES
  ('Women''s Trainers', 'Stylish and comfortable trainers', 'c0a8f9b0-0000-4000-8000-000000000002'),
  ('Women''s Active Wear', 'Performance footwear for active women', 'c0a8f9b0-0000-4000-8000-000000000002'),
  ('Women''s Casual Shoes', 'Everyday casual footwear', 'c0a8f9b0-0000-4000-8000-000000000002'),
  ('Women''s Flats', 'Comfortable and elegant flats', 'c0a8f9b0-0000-4000-8000-000000000002'),
  ('Women''s Running Shoes', 'Specialized shoes for runners', 'c0a8f9b0-0000-4000-8000-000000000002'),
  ('Women''s Lifestyle', 'Fashion-forward everyday shoes', 'c0a8f9b0-0000-4000-8000-000000000002');

-- Insert kids' subcategories
INSERT INTO temp_categories (name, description, parent_id) VALUES
  ('Kids'' Trainers', 'Comfortable trainers for children', 'c0a8f9b0-0000-4000-8000-000000000003'),
  ('Kids'' Active Sneakers', 'Active shoes for energetic kids', 'c0a8f9b0-0000-4000-8000-000000000003'),
  ('Kids'' School Shoes', 'Durable shoes perfect for school', 'c0a8f9b0-0000-4000-8000-000000000003');

-- Update products to use default category temporarily
UPDATE products 
SET category_id = NULL 
WHERE category_id IS NOT NULL;

-- Now we can safely remove old categories
DELETE FROM product_categories;

-- Copy new categories to product_categories table
INSERT INTO product_categories (id, name, description, parent_id, created_at)
SELECT id, name, description, parent_id, created_at
FROM temp_categories;

-- Drop temporary table
DROP TABLE temp_categories;

-- Create function to get full category name
CREATE OR REPLACE FUNCTION get_full_category_name(category_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  full_name text;
  current_id uuid;
  current_name text;
BEGIN
  -- Get the initial category name
  SELECT name INTO full_name
  FROM product_categories
  WHERE id = category_id;

  -- Get the parent chain
  current_id := category_id;
  WHILE EXISTS (
    SELECT 1
    FROM product_categories
    WHERE id = current_id
    AND parent_id IS NOT NULL
  ) LOOP
    -- Get parent info
    SELECT parent_id, name INTO current_id, current_name
    FROM product_categories
    WHERE id = current_id;
    
    -- Prepend parent name
    full_name := current_name || ' > ' || full_name;
  END LOOP;

  RETURN full_name;
END;
$$;