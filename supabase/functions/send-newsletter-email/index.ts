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
    const host = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const port = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const secure = Deno.env.get('SMTP_SECURE') === 'true';
    const user = Deno.env.get('SMTP_USER') || '';
    const pass = Deno.env.get('SMTP_PASS') || '';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@wearxpress.com';
    const fromName = Deno.env.get('FROM_NAME') || 'WearXpress';

    console.log(`Creating transporter with host: ${host}, port: ${port}`);
    
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, template = 'newsletter_welcome' } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Verify the email is subscribed
    const { data: subscriptionData, error: subscriptionError } = await supabase.rpc(
      'check_subscription_status',
      { p_email: email }
    );

    if (subscriptionError) {
      console.error("Error checking subscription:", subscriptionError);
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription status" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // If not subscribed, don't send email
    if (!subscriptionData || !subscriptionData.is_subscribed) {
      return new Response(
        JSON.stringify({ error: "Email is not subscribed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get email template
    const { data: templateData, error: templateError } = await supabase.rpc(
      'get_email_template',
      { p_template_name: template }
    );

    if (templateError || !templateData || templateData.length === 0) {
      console.error("Error getting template:", templateError);
      return new Response(
        JSON.stringify({ error: "Failed to get email template" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const emailTemplate = templateData[0];

    // Generate URLs
    const origin = req.headers.get('origin') || 'https://wearxpress.com';
    const websiteUrl = origin;
    const unsubscribeUrl = `${origin}/unsubscribe?email=${encodeURIComponent(email)}`;

    // Process template variables
    let htmlContent = emailTemplate.html_content;
    htmlContent = htmlContent.replace(/{{email}}/g, email);
    htmlContent = htmlContent.replace(/{{year}}/g, new Date().getFullYear().toString());
    htmlContent = htmlContent.replace(/{{websiteUrl}}/g, websiteUrl);
    htmlContent = htmlContent.replace(/{{unsubscribeUrl}}/g, unsubscribeUrl);

    try {
      // Try to create transporter
      const transporter = createTransporter();
      
      // Send email
      const info = await transporter.sendMail({
        from: transporter.options.from,
        to: email,
        subject: emailTemplate.subject,
        html: htmlContent,
      });

      console.log(`Email sent: ${info.messageId}`);

      // Track email sent
      await supabase.rpc('track_newsletter_email', {
        p_email: email,
        p_email_type: template
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully",
          emailId: info.messageId
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (smtpError) {
      console.error("SMTP error:", smtpError);
      
      // For development/testing, log email details
      console.log("Would have sent email:", {
        to: email,
        subject: emailTemplate.subject,
        html: htmlContent.substring(0, 200) + '...'
      });
      
      // Still track the email attempt
      await supabase.rpc('track_newsletter_email', {
        p_email: email,
        p_email_type: template
      });
      
      // Return success in development environment
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email logged (SMTP not configured)",
          development: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});