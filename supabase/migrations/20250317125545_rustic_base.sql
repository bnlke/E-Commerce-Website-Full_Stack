/*
  # Add Category Hierarchy Support

  1. Changes
    - Add parent_id column to product_categories table
    - Add foreign key constraint
    - Add index for better performance
    - Add validation to prevent self-referencing
    - Add trigger to prevent circular references

  2. Security
    - Maintain existing RLS policies
*/

-- Add parent_id column
ALTER TABLE product_categories 
ADD COLUMN parent_id uuid REFERENCES product_categories(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id 
ON product_categories(parent_id);

-- Create function to check for circular references
CREATE OR REPLACE FUNCTION check_category_circular_reference()
RETURNS trigger AS $$
DECLARE
  current_parent uuid;
BEGIN
  -- If parent_id is NULL, no circular reference possible
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check for direct self-reference
  IF NEW.id = NEW.parent_id THEN
    RAISE EXCEPTION 'Category cannot reference itself';
  END IF;

  -- Check for circular references
  current_parent := NEW.parent_id;
  WHILE current_parent IS NOT NULL LOOP
    IF current_parent = NEW.id THEN
      RAISE EXCEPTION 'Circular reference detected in category hierarchy';
    END IF;
    
    SELECT parent_id INTO current_parent
    FROM product_categories
    WHERE id = current_parent;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent circular references
CREATE TRIGGER prevent_category_circular_reference
  BEFORE INSERT OR UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION check_category_circular_reference();

-- Create function to get category path
CREATE OR REPLACE FUNCTION get_category_path(category_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  level int
) AS $$
WITH RECURSIVE category_tree AS (
  -- Base case
  SELECT 
    c.id,
    c.name,
    0 as level
  FROM product_categories c
  WHERE c.id = category_id

  UNION ALL

  -- Recursive case
  SELECT 
    c.id,
    c.name,
    ct.level + 1
  FROM product_categories c
  INNER JOIN category_tree ct ON c.id = ct.id
  WHERE c.parent_id IS NOT NULL
)
SELECT * FROM category_tree;
$$ LANGUAGE sql;