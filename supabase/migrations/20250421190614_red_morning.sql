/*
  # Add Password Reset Email Template
  
  1. New Templates
    - `password_reset` - Template for password reset emails
  
  2. Security
    - Maintains existing RLS policies
*/

-- Insert password reset template
INSERT INTO email_templates (name, subject, html_content)
VALUES 
  ('password_reset', 'Reset Your WearXpress Password', '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your WearXpress Password</title>
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
        <h1>Reset Your Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password for your WearXpress account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetLink}}" class="button">Reset Password</a>
        </div>
        
        <div class="highlight">
          <p>If you didn''t request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        </div>
        
        <p>This password reset link will expire in 24 hours.</p>
      </div>
      <div class="footer">
        <p>© {{year}} WearXpress. All rights reserved.</p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>
  </body>
</html>')
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  updated_at = now();