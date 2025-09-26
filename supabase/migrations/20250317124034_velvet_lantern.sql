/*
  # Storage bucket and policies for product images
  
  1. Storage Setup
    - Checks for and creates products bucket if it doesn't exist
    - Configures public access for product images
  
  2. Security
    - Enables RLS policies for bucket access
    - Configures granular access control:
      - Public read access for all product images
      - Admin-only write access for product management
*/

-- First check if bucket exists and create if it doesn't
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('products', 'products', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on the bucket
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
    AND is_admin()
  );

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
    AND is_admin()
  );

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
    AND is_admin()
  );