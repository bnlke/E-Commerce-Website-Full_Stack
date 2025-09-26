/*
  # Add Email Templates Table
  
  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `subject` (text)
      - `html_content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS
    - Add admin-only policies
    - Insert default templates
*/

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Everyone can view email templates"
  ON email_templates
  FOR SELECT
  USING (true);

-- Insert default templates
INSERT INTO email_templates (name, subject, html_content) VALUES
(
  'newsletter_welcome',
  'Welcome to WearXpress Newsletter',
  '<html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
        .button { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WearXpress Newsletter!</h1>
        </div>
        <div class="content">
          <p>Thank you for subscribing to our newsletter. You''ll now receive updates on our latest products, special offers, and more.</p>
          <p>We''re excited to have you join our community!</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{unsubscribeUrl}}" class="button">Unsubscribe</a>
        </div>
        <div class="footer">
          <p>© {{year}} WearXpress. All rights reserved.</p>
          <p>If you didn''t subscribe to this newsletter, please click the unsubscribe link above.</p>
        </div>
      </div>
    </body>
  </html>'
),
(
  'newsletter_unsubscribe',
  'You''ve been unsubscribed from WearXpress Newsletter',
  '<html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
        .button { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You''ve Been Unsubscribed</h1>
        </div>
        <div class="content">
          <p>We''re sorry to see you go. You''ve been successfully unsubscribed from the WearXpress newsletter.</p>
          <p>If you change your mind, you can always subscribe again on our website.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{websiteUrl}}" class="button">Visit Website</a>
        </div>
        <div class="footer">
          <p>© {{year}} WearXpress. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>'
);

-- Create function to get email template
CREATE OR REPLACE FUNCTION get_email_template(p_template_name text)
RETURNS TABLE (
  subject text,
  html_content text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    et.subject,
    et.html_content
  FROM email_templates et
  WHERE et.name = p_template_name;
END;
$$;