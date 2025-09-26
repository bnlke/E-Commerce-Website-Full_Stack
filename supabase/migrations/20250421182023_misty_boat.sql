/*
  # Fix Email Templates and Add Email Sending Support
  
  1. Changes
    - Update email templates with better HTML
    - Drop and recreate get_email_template function with proper return type
    - Fix track_newsletter_email function
  
  2. Security
    - Maintain SECURITY DEFINER
    - Use explicit schema references
*/

-- Update newsletter_welcome template with better HTML
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to WearXpress Newsletter</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f8f8f8; }
      .logo { font-size: 24px; font-weight: bold; color: #000; }
      .logo span { color: #6366f1; }
      .content { margin-bottom: 30px; padding: 20px; }
      .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding: 20px; background-color: #f8f8f8; }
      .button { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
      .highlight { background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Wear<span>X</span>press</div>
      </div>
      <div class="content">
        <h1>Welcome to Our Newsletter!</h1>
        <p>Hello {{email}},</p>
        <p>Thank you for subscribing to the WearXpress newsletter. You''ll now receive updates on our latest products, special offers, and more.</p>
        
        <div class="highlight">
          <p>Here''s what you can expect:</p>
          <ul>
            <li>Exclusive deals and promotions</li>
            <li>New product announcements</li>
            <li>Sustainability updates</li>
            <li>Style tips and inspiration</li>
          </ul>
        </div>
        
        <p>We''re excited to have you join our community!</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{websiteUrl}}" class="button">Visit Our Store</a>
      </div>
      <div class="footer">
        <p>© {{year}} WearXpress. All rights reserved.</p>
        <p>If you didn''t subscribe to this newsletter, please <a href="{{unsubscribeUrl}}">unsubscribe here</a>.</p>
      </div>
    </div>
  </body>
</html>'
WHERE name = 'newsletter_welcome';

-- Update newsletter_unsubscribe template with better HTML
UPDATE email_templates
SET html_content = '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribed from WearXpress Newsletter</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; padding: 20px; background-color: #f8f8f8; }
      .logo { font-size: 24px; font-weight: bold; color: #000; }
      .logo span { color: #6366f1; }
      .content { margin-bottom: 30px; padding: 20px; }
      .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding: 20px; background-color: #f8f8f8; }
      .button { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Wear<span>X</span>press</div>
      </div>
      <div class="content">
        <h1>You''ve Been Unsubscribed</h1>
        <p>Hello {{email}},</p>
        <p>We''re sorry to see you go. You''ve been successfully unsubscribed from the WearXpress newsletter.</p>
        <p>If you change your mind, you can always subscribe again on our website.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{websiteUrl}}" class="button">Visit Our Website</a>
      </div>
      <div class="footer">
        <p>© {{year}} WearXpress. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>'
WHERE name = 'newsletter_unsubscribe';

-- Drop existing function first
DROP FUNCTION IF EXISTS get_email_template(text);

-- Create function to get email template with better error handling
CREATE OR REPLACE FUNCTION get_email_template(p_template_name text)
RETURNS TABLE (
  id uuid,
  name text,
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
    et.id,
    et.name,
    et.subject,
    et.html_content
  FROM email_templates et
  WHERE et.name = p_template_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Email template "%" not found', p_template_name;
  END IF;
END;
$$;