import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    
    const { email } = await req.json();
    
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

    // Get the unsubscribe email template
    const { data: templateData, error: templateError } = await supabase.rpc('get_email_template', {
      p_template_name: 'newsletter_unsubscribe'
    });

    if (templateError) {
      throw templateError;
    }

    if (!templateData || templateData.length === 0) {
      throw new Error('Email template not found');
    }

    const template = templateData[0];
    
    // Generate website URL
    const websiteUrl = `${req.headers.get('origin')}`;
    
    // Replace template variables
    let htmlContent = template.html_content
      .replace(/{{websiteUrl}}/g, websiteUrl)
      .replace(/{{year}}/g, new Date().getFullYear().toString())
      .replace(/{{email}}/g, email);

    // Send email using Supabase Edge Function
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: template.subject,
        html: htmlContent,
      },
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Unsubscribe confirmation email sent' }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error sending unsubscribe email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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