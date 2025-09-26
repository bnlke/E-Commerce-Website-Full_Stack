import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface BuyButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function BuyButton({ priceId, mode, className, children, disabled = false }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (disabled) return;
    
    if (!user) {
      navigate('/login', { state: { returnTo: window.location.pathname } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('../lib/supabase').then(m => m.supabase.auth.getSession())).data.session?.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/payment-confirmation?redirect=auto`,
          cancel_url: `${window.location.origin}/`,
          mode,
        }),
      }).then(res => res.json());

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`flex items-center justify-center ${className || 'bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          children || 'Buy Now'
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}