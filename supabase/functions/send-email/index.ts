import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import nodemailer from 'npm:nodemailer@6.9.9';

// For testing purposes when SMTP is not configured
const testAccount = {
  user: 'user@example.com',
  pass: 'password',
};

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
    const user = Deno.env.get('SMTP_USER') || testAccount.user;
    const pass = Deno.env.get('SMTP_PASS') || testAccount.pass;
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
    const { to, subject, html, text } = await req.json();
    
    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: 'Email recipient, subject, and content are required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Create transporter
    let transporter;
    try {
      transporter = createTransporter();
      console.log('Email transporter created successfully');
    } catch (transportError) {
      console.error('Failed to create email transporter:', transportError);
      
      // For development, log the email content instead of sending
      console.log('Email would have been sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html?.substring(0, 100)}...`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (SMTP not configured)',
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
        to,
        subject,
        text: text || '',
        html: html || '',
      });
      console.log('Email sent successfully:', info.messageId);
    } catch (sendError) {
      console.error('Failed to send email:', sendError);
      
      // For development, log the email content instead of sending
      console.log('Email would have been sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html?.substring(0, 100)}...`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (SMTP error)',
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

    // Track email in database if authenticated
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Track email in database
        await supabase.rpc('track_newsletter_email', {
          p_email: to,
          p_email_type: subject.includes('Welcome') ? 'welcome' : 'other'
        });
      }
    } catch (trackingError) {
      // Log but don't fail if tracking fails
      console.error('Error tracking email:', trackingError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
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
    console.error('Error sending email:', error);
    
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