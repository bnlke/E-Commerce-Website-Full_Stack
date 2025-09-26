import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Loader, CreditCard } from 'lucide-react';

interface StripeCheckoutProps {
  clientSecret: string;
  onClose: () => void;
}

export default function StripeCheckout({ clientSecret, onClose }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dispatch } = useCart();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    // Check the payment intent status
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Please provide your payment details.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-confirmation`,
        receipt_email: user?.email,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, now record the order in our database
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-payment-success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            user_id: user?.id,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Clear the cart
          dispatch({ type: 'CLEAR_CART' });
          
          // Navigate to order confirmation
          navigate(`/account/orders/${data.order_id}`);
        } else {
          setMessage('Payment succeeded but failed to create order. Please contact support.');
        }
      } catch (err) {
        console.error('Error recording order:', err);
        setMessage('Payment succeeded but failed to create order. Please contact support.');
      }
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Details
        </h3>
        <PaymentElement id="payment-element" />
      </div>
      
      <div>
        <h3 className="font-semibold">Shipping Address</h3>
        <AddressElement 
          options={{
            mode: 'shipping',
            allowedCountries: ['US', 'CA', 'GB', 'AU'],
          }}
        />
      </div>
      
      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
      
      {message && (
        <div className={`p-4 rounded-md ${message.includes('succeeded') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}
    </form>
  );
}