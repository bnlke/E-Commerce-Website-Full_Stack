/*
  # Add Newsletter Subscribers Table
  
  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `status` (text) - active, unsubscribed
  
  2. Security
    - Enable RLS
    - Add policies for admin access
    - Allow public subscription
*/

-- Create newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Public can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to subscribe to newsletter
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new subscriber
  INSERT INTO newsletter_subscribers (email)
  VALUES (p_email)
  ON CONFLICT (email) 
  DO UPDATE SET 
    status = 'active',
    created_at = now();
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;

-- Create function to unsubscribe from newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update subscriber status
  UPDATE newsletter_subscribers
  SET status = 'unsubscribed'
  WHERE email = p_email;
  
  RETURN FOUND;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;

-- Create function to get newsletter stats
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS TABLE (
  total_subscribers bigint,
  active_subscribers bigint,
  unsubscribed bigint,
  last_week_subscribers bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
    COUNT(*) FILTER (WHERE created_at > now() - interval '7 days') as last_week_subscribers
  FROM newsletter_subscribers;
END;
$$;