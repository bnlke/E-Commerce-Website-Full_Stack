-- Create email templates table if it doesn't exist
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Everyone can view email templates" ON email_templates;

-- Create policies
CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Everyone can view email templates"
  ON email_templates
  FOR SELECT
  TO public
  USING (true);

-- Insert default templates if they don't exist
INSERT INTO email_templates (name, subject, html_content)
VALUES 
  ('newsletter_welcome', 'Welcome to WearXpress Newsletter', '<h1>Welcome to Our Newsletter</h1><p>Hello {{email}},</p><p>Thank you for subscribing!</p>'),
  ('newsletter_unsubscribe', 'You''ve Been Unsubscribed from WearXpress Newsletter', '<h1>You''ve Been Unsubscribed</h1><p>Hello {{email}},</p><p>You''ve been successfully unsubscribed.</p>')
ON CONFLICT (name) DO NOTHING;