/*
  # Remove products with Unsplash images

  1. Changes
    - Delete all products that have Unsplash image URLs
    - Add constraint to prevent Unsplash URLs in the future
  
  2. Security
    - Only affects products table
    - Maintains RLS policies
*/

-- Delete products with Unsplash image URLs
DELETE FROM products 
WHERE image_url LIKE '%unsplash.com%';

-- Create a function to validate image URLs
CREATE OR REPLACE FUNCTION validate_image_url()
RETURNS trigger AS $$
BEGIN
  IF NEW.image_url LIKE '%unsplash.com%' THEN
    RAISE EXCEPTION 'Unsplash image URLs are not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent Unsplash URLs
CREATE TRIGGER prevent_unsplash_urls
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_image_url();