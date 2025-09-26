import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@14.18.0';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16'
    });
    const requestData = await req.json();
    const { payment_intent_id, user_id, client_secret } = requestData;
    // Extract payment intent ID from client secret if provided
    let paymentIntentId1 = payment_intent_id;
    if (!paymentIntentId1 && client_secret) {
      paymentIntentId1 = client_secret.split('_secret_')[0];
    }
    if (!paymentIntentId1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment intent ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Extract payment intent ID from client secret if provided
    let paymentIntentId1 = payment_intent_id;
    if (!paymentIntentId1 && client_secret) {
      paymentIntentId1 = client_secret.split('_secret_')[0];
    }
    if (!paymentIntentId1) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment intent ID is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    console.log(`Processing payment success for payment_intent_id: ${paymentIntentId1}, user_id: ${user_id}`);
    // Retrieve the payment intent to get order details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId1);
    console.log(`Payment intent status: ${paymentIntent.status}, amount: ${paymentIntent.amount}`);
    // Only decrease stock if payment was successful
    // Only decrease stock if payment was successful
    if (paymentIntent.status === 'succeeded') {
      // Parse order items from metadata
      let orderItems = [];
      try {
        if (paymentIntent.metadata.order_items) {
          orderItems = JSON.parse(paymentIntent.metadata.order_items);
          console.log(`Found ${orderItems.length} items in order_items metadata`);
        } else {
          console.log('No order_items in metadata, checking line items');
          // If no order_items in metadata, try to get from line items
          const session = await stripe.checkout.sessions.retrieve(paymentIntent.metadata.checkout_session_id || '', {
            expand: [
              'line_items'
            ]
          });
          if (session.line_items?.data) {
            orderItems = session.line_items.data.map((item)=>({
                id: item.price?.product,
                name: item.description || 'Product',
                price: (item.amount_total || 0) / 100 / (item.quantity || 1),
                quantity: item.quantity || 1,
                size: 'One Size' // Default size if not specified
              }));
            console.log(`Extracted ${orderItems.length} items from line_items`);
          }
        }
      } catch (parseError) {
        console.error('Error parsing order items:', parseError);
      // Continue with empty order items
      }
      const shippingAddress = paymentIntent.metadata.shipping_address ? JSON.parse(paymentIntent.metadata.shipping_address) : null;
      if (orderItems.length > 0) {
        // Decrease stock for each item
        for (const item of orderItems){
          try {
            // Update stock quantity in database
            const { error: stockError } = await supabase.rpc('increment_stock', {
              p_product_id: item.id,
              p_size: item.size,
              p_quantity: -item.quantity
            });
            if (stockError) {
              console.error(`Error updating stock for product ${item.id}, size ${item.size}:`, stockError);
            } else {
              console.log(`Successfully decreased stock for product ${item.id}, size ${item.size} by ${item.quantity}`);
            }
          } catch (stockErr) {
            console.error('Error updating stock:', stockErr);
          // Continue processing other items even if one fails
          }
        }
      }
      // Get or create shipping address in database if available from Stripe
      let shippingAddressId = null;
      if (paymentIntent.shipping && user_id) {
        try {
          console.log('Creating shipping address from payment intent');
          const { data: addressData, error: addressError } = await supabase.from('user_addresses').insert({
            user_id,
            name: paymentIntent.shipping.name,
            address_line1: paymentIntent.shipping.address.line1,
            address_line2: paymentIntent.shipping.address.line2 || '',
            city: paymentIntent.shipping.address.city,
            state: paymentIntent.shipping.address.state,
            postal_code: paymentIntent.shipping.address.postal_code,
            country: paymentIntent.shipping.address.country,
            is_default: false
          }).select().single();
          if (addressError) {
            console.error('Error creating shipping address:', addressError);
          } else if (addressData) {
            console.log(`Created shipping address with ID: ${addressData.id}`);
            shippingAddressId = addressData.id;
          }
        } catch (addressErr) {
          console.error('Error saving shipping address:', addressErr);
        // Continue with order creation even if address saving fails
        }
      }
      // Create order in database
      console.log('Creating order in database');
      const { data: orderId, error: orderError } = await supabase.rpc('ensure_order_created_once', {
        p_payment_intent_id: paymentIntentId1,
        p_user_id: user_id,
        p_total_amount: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
        p_shipping_address_id: shippingAddressId || shippingAddress?.id || null
      });
      if (orderError) {
        console.error('Error creating order:', orderError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to create order: ' + orderError.message
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      console.log(`Created or retrieved order with ID: ${orderId}`);
      if (orderItems.length > 0 && orderId) {
        // Create order items
        const orderItemsData = orderItems.map((item)=>({
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price
          }));
        console.log(`Creating ${orderItemsData.length} order items`);
        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData).select();
        if (itemsError) {
          console.error('Error creating order items:', itemsError);
        // Don't throw here, we still want to return the order ID
        // The order was created successfully, just not all items
        }
        console.log(`Order items ${itemsError ? 'partially' : 'successfully'} created`);
      } else {
        console.log('No order items to create');
      }
      return new Response(JSON.stringify({
        success: true,
        order_id: orderId
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } else {
      // Payment was not successful, don't decrease stock
      console.error(`Payment not successful. Status: ${paymentIntent.status}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Payment not successful. Status: ${paymentIntent.status}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      payment_intent_id: paymentIntentId
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
