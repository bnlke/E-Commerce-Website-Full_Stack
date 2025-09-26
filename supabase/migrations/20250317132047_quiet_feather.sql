/*
  # Add slug field to products table

  1. Changes
    - Add slug column to products table
    - Create unique index on slug
    - Add function to generate slugs
    - Update existing products with slugs

  2. Security
    - No changes to RLS policies needed
*/

-- Add slug column
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON products(slug);

-- Function to generate slug
CREATE OR REPLACE FUNCTION generate_product_slug(product_name text, product_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(product_name, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Initial attempt with base slug
  new_slug := base_slug;
  
  -- Keep trying until we find a unique slug
  WHILE EXISTS (
    SELECT 1 FROM products 
    WHERE slug = new_slug 
    AND (product_id IS NULL OR id != product_id)
  ) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN new_slug;
END;
$$;

-- Trigger function to auto-generate slug
CREATE OR REPLACE FUNCTION products_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_product_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER products_generate_slug_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_generate_slug();

-- Update existing products with slugs
UPDATE products 
SET slug = generate_product_slug(name, id)
WHERE slug IS NULL OR slug = '';