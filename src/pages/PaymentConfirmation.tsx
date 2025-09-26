import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader, ArrowRight, ShoppingBag, Package, MapPin, CreditCard, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderSummary {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: {
    id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    product: {
      name: string;
      image_url: string;
      slug: string;
    };
  }[];
  shipping_address?: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  payment_details?: {
    card_type: string;
    last_four: string;
    expiry_date: string;
    cardholder_name: string;
  };
}

export default function PaymentConfirmation() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null); 
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const { user } = useAuth();
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);

  // Function to clear all cart items
  const clearCart = () => {
    try {
      // Clear the cart completely
      dispatch({ type: 'CLEAR_CART' });
      
      // Also remove any pending checkout items from localStorage
      localStorage.removeItem('pendingCheckoutItems');
      
      // Clear the cart in localStorage directly to ensure it's empty
      localStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));
      
      console.log('Cart cleared successfully after payment');
    } catch (err) {
      console.error('Error clearing cart items:', err);
    }
  };

  useEffect(() => {
    // Get payment_intent_client_secret or payment_intent from URL
    const clientSecret = new URLSearchParams(location.search).get('payment_intent_client_secret') || '';
    const paymentIntentId = new URLSearchParams(location.search).get('payment_intent') || '';
    const redirectParam = new URLSearchParams(location.search).get('redirect') || '';
    const checkOrderInterval = 3000; // 3 seconds
    const maxCheckOrderAttempts = 10;

    // Extract payment intent ID from client secret if needed
    let paymentId = paymentIntentId;
    if (!paymentId && clientSecret) {
      // Client secret format is: pi_1234567890_secret_1234567890
      paymentId = clientSecret.split('_secret_')[0];
    }

    // Function to check if order exists
    const checkOrderExists = async (paymentId: string) => {
      try {
        setIsCheckingOrder(true);
        const { data, error } = await supabase.rpc('get_order_by_payment_intent_direct', {
          p_payment_intent_id: paymentId
        });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log('Order found:', data[0]);
          // Order found
          setStatus('success');
          setMessage('Your payment was successful! Your order has been placed.');
          setOrderId(data[0].id);
          setOrderSummary(data[0] as OrderSummary);
          clearCart();
          return true;
        }
        
        return false;
      } catch (err) {
        console.error('Error checking order:', err);
        return false;
      } finally {
        setIsCheckingOrder(false);
      }
    };

    async function processPayment() {
      try {
        // If we don't have a payment ID, try to get the most recent order
        console.log('Processing payment with ID:', paymentId);
        if (!paymentId) {
          console.log('No payment intent ID found, trying to get most recent order');
          const { data: orderData, error: orderError } = await supabase.rpc('get_user_orders');
          
          if (orderError) {
            throw orderError;
          }
          console.log('Order data:', orderData);
          
          if (orderData && orderData.length > 0) {
            // Use the most recent order
            setStatus('success');
            setMessage('Your order has been placed successfully.');
            setOrderId(orderData[0].id);
            setOrderSummary(orderData[0] as OrderSummary);
            clearCart();
            return;
          } else {
            // No payment intent and no recent orders - redirect to home
            localStorage.setItem('orderMessage', 'No recent orders found');
            navigate('/account/orders');
            return;
          }
        }

        // First check if order already exists
        const orderExists = await checkOrderExists(paymentId);

        if (!orderExists) {
          // Order not found, try to ensure it's synced from Stripe
          await supabase.rpc('ensure_all_stripe_orders_synced');
          
          // Set up polling to check for the order
          const intervalId = setInterval(async () => {
            // Increment attempt counter
            setCheckAttempts(prev => prev + 1);
            const currentAttempts = checkAttempts + 1;
            
            const found = await checkOrderExists(paymentId);
            if (found || checkAttempts >= maxCheckOrderAttempts) {
              clearInterval(intervalId);
              
              if (!found && checkAttempts >= maxCheckOrderAttempts) {
                // Still not found after max attempts
                console.log(`No order found after ${maxCheckOrderAttempts} attempts, trying to create one`);
                // Try to create order directly
                const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-payment-success`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  },
                  body: JSON.stringify({
                    payment_intent_id: paymentId,
                    user_id: user?.id,
                  }),
                });

                const data = await response.json(); 
                console.log('Payment success response:', data);
                
                if (data.success) {
                  // Payment was successful and order was created
                  clearCart();
                  
                  // Set success status and message
                  setStatus('success');
                  setMessage('Your payment was successful! Your order has been placed.');
                  setOrderId(data.order_id); 
                  
                  // Fetch order details for display
                  await fetchOrderDetails(data.order_id);
                } else {
                  // Payment succeeded but order creation failed
                  setStatus('error');
                  setMessage('Payment succeeded but failed to create order. Please contact support.');
                }
              }
            }
          }, checkOrderInterval);
        }
      } catch (err) {
        console.error('Error processing payment:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to process payment');
      }
    }

    processPayment();
  }, [location.search, user]);

  // Fetch order details for display
  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_order_by_id', { p_order_id: orderId });
      
      if (error) {
        console.error('Error fetching order details:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Order details fetched:', data[0]);
        setOrderSummary(data[0] as OrderSummary);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-36 pb-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />              
              </div>
              <h1 className="text-2xl font-bold mb-3">
                {isCheckingOrder ? 'Checking Order Status' : 'Processing Your Payment'}
              </h1>
              <p className="text-gray-600 mb-4">
                {isCheckingOrder 
                  ? `Please wait while we retrieve your order details... (Attempt ${checkAttempts + 1})`
                  : 'Please wait while we confirm your payment and process your order...'}
              </p>
              <div className="w-full max-w-md bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-blue-500 h-full animate-pulse" style={{ width: `${Math.min(100, (checkAttempts + 1) * 10)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500">This may take a few moments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {status === 'success' ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-50 p-6 border-b border-green-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">Payment Successful!</h1>
                  <p className="text-green-700">{message}</p>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            {orderSummary ? (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Order Summary</h2>
                  <p className="text-gray-600">Order #{orderSummary.id.slice(0, 8)} • {new Date(orderSummary.created_at).toLocaleDateString()}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Payment Successful
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Items
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {orderSummary.items.map((item, index) => (
                      <div key={item.id} className={`flex items-center py-3 ${index !== orderSummary.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        <div className="w-16 h-16 rounded overflow-hidden mr-4">
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <div className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(item.price_at_time * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">${item.price_at_time.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-bold text-lg">${orderSummary.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Shipping Information */}
                  {orderSummary.shipping_address && (
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">{orderSummary.shipping_address.name}</p>
                        <p>{orderSummary.shipping_address.address_line1}</p>
                        {orderSummary.shipping_address.address_line2 && (
                          <p>{orderSummary.shipping_address.address_line2}</p>
                        )}
                        <p>
                          {orderSummary.shipping_address.city}, {orderSummary.shipping_address.state} {orderSummary.shipping_address.postal_code}
                        </p>
                        <p>{orderSummary.shipping_address.country}</p>
                        {orderSummary.shipping_address.phone && (
                          <p className="mt-2">Phone: {orderSummary.shipping_address.phone}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Information */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {orderSummary.payment_details ? (
                        <>
                          <p>
                            <span className="font-medium">Card:</span> {orderSummary.payment_details.card_type.charAt(0).toUpperCase() + orderSummary.payment_details.card_type.slice(1)} ending in {orderSummary.payment_details.last_four}
                          </p>
                          <p className="mt-1">
                            <span className="font-medium">Cardholder:</span> {orderSummary.payment_details.cardholder_name}
                          </p>
                        </>
                      ) : (
                        <p>
                          <span className="font-medium">Payment Method:</span> Stripe
                        </p>
                      )}
                      <p className="mt-2">
                        <span className="font-medium">Status:</span> <span className="text-green-600">Paid</span>
                      </p>
                      <p className="mt-2">
                        <span className="font-medium">Date:</span> {new Date(orderSummary.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Link 
                    to={`/account/orders/${orderSummary.id}`}
                    className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors shadow-sm font-medium space-x-2"
                  >
                    <ShoppingBag className="mr-2 w-5 h-5" />
                    <span>View Order Details</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link 
                    to="/"
                    className="inline-flex items-center justify-center border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="flex flex-col space-y-4">
                  {orderId && (
                    <Link 
                      to={`/account/orders/${orderId}`}
                      className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors shadow-sm font-medium"
                    >
                      <ShoppingBag className="mr-2 w-5 h-5" />
                      View Your Order
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  )}
                  <Link 
                    to="/"
                    className="inline-flex items-center justify-center border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="flex flex-col space-y-4 mt-8">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors shadow-sm font-medium"
              >
                Try Again
              </button>
              <Link 
                to="/"
                className="inline-flex items-center justify-center border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}