import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import nodemailer from 'npm:nodemailer@6.9.9';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Create a reusable transporter object
const createTransporter = () => {
  try {
    // Get SMTP configuration from environment variables
    const host = Deno.env.get('SMTP_HOST') || 'smtp.ethereal.email';
    const port = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const secure = Deno.env.get('SMTP_SECURE') === 'true';
    const user = Deno.env.get('SMTP_USER') || '';
    const pass = Deno.env.get('SMTP_PASS') || '';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@wearxpress.com';
    const fromName = Deno.env.get('FROM_NAME') || 'WearXpress';

    console.log(`Creating transporter with host: ${host}, port: ${port}, secure: ${secure}`);
    
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
    }, {
      from: `"${fromName}" <${fromEmail}>`,
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    throw error;
  }
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, resetLink } = await req.json();
    
    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: 'Email and reset link are required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Get the password reset email template
    const { data: templateData, error: templateError } = await supabase.rpc('get_email_template', {
      p_template_name: 'password_reset'
    });

    if (templateError) {
      throw templateError;
    }

    if (!templateData || templateData.length === 0) {
      throw new Error('Email template not found');
    }

    const template = templateData[0];
    
    // Generate website URL
    const websiteUrl = req.headers.get('origin') || 'https://wearxpress.com';
    
    // Replace template variables
    let htmlContent = template.html_content
      .replace(/{{resetLink}}/g, resetLink)
      .replace(/{{websiteUrl}}/g, websiteUrl)
      .replace(/{{year}}/g, new Date().getFullYear().toString())
      .replace(/{{email}}/g, email);

    // Create transporter
    let transporter;
    try {
      transporter = createTransporter();
      console.log('Email transporter created successfully');
    } catch (transportError) {
      console.error('Failed to create email transporter:', transportError);
      
      // For development, log the email content instead of sending
      console.log('Password reset email would have been sent:');
      console.log(`To: ${email}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`HTML: ${htmlContent.substring(0, 100)}...`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset email logged (SMTP not configured)',
          development: true
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
    
    // Send email
    let info;
    try {
      info = await transporter.sendMail({
        from: transporter.options.from,
        to: email,
        subject: template.subject,
        html: htmlContent,
      });
      console.log('Password reset email sent successfully:', info.messageId);
    } catch (sendError) {
      console.error('Failed to send password reset email:', sendError);
      
      // For development, log the email content instead of sending
      console.log('Password reset email would have been sent:');
      console.log(`To: ${email}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log(`HTML: ${htmlContent.substring(0, 100)}...`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset email logged (SMTP error)',
          development: true,
          error: sendError.message
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent successfully',
        messageId: info.messageId
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});