import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, Plus, Minus, Loader, CreditCard, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Cart({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const cartRef = useRef<HTMLDivElement>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Memoize cart total for better performance
  const cartTotal = useMemo(() => {
    return state.total.toFixed(2);
  }, [state.total]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  // Memoize updateQuantity function
  const updateQuantity = useCallback(async (cartId: string, quantity: number) => {
    const item = state.items.find(item => item.cartId === cartId);
    if (!item) return;
    
    if (quantity < 1) {
      // If quantity would be less than 1, remove the item completely
      await removeItem(cartId);
      return;
    }
    
    // Use RPC function for better performance
    if (quantity < item.quantity) {
      try {
        const quantityDiff = item.quantity - quantity;
        const { error } = await supabase.rpc('increment_stock', {
          p_product_id: item.id,
          p_size: item.size,
          p_quantity: quantityDiff
        });

        if (error) throw error;
      } catch (err) {
        console.error('Error restoring stock:', err);
        return;
      }
    }
    
    // Update cart quantity
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } });
  }, [state.items, dispatch]);

  const removeItem = useCallback(async (cartId: string) => {
    const item = state.items.find(item => item.cartId === cartId);
    if (!item) return;
    
    try {
      // Use PostgreSQL's native increment syntax
      const { error } = await supabase.rpc('increment_stock', {
        p_product_id: item.id,
        p_size: item.size,
        p_quantity: item.quantity
      });

      if (error) throw error;

      // Remove from cart
      dispatch({ type: 'REMOVE_ITEM', payload: cartId });
    } catch (err) {
      console.error('Error restoring stock:', err);
    }
  }, [state.items, dispatch]);

  const handleCheckout = useCallback(async () => {
    if (state.items.length === 0) return;
    
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // If user is not logged in, redirect to login
      if (!user) {
        window.location.href = '/login';
        return;
      }
      
      // Create a checkout session with Stripe
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: 'custom', // Special value to indicate cart checkout
          success_url: `${window.location.origin}/payment-confirmation?redirect=auto`,
          cancel_url: `${window.location.origin}/`,
          mode: 'payment',
          items: state.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size
          }))
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      // Store cart items in localStorage before redirecting
      localStorage.setItem('pendingCheckoutItems', JSON.stringify(state.items));
      
      // Redirect to Stripe Checkout (using navigate would be better but we need a full page reload)
      window.location.href = data.url; 
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setPaymentError(err instanceof Error ? err.message : 'Failed to create checkout session');
      setIsProcessingPayment(false);
    }
  }, [state.items, user, navigate]);

  return (
    <div ref={cartRef} className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-50 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.cartId} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={item.image_url || item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-500">${item.price}</p>
                    <p className="text-gray-500 text-sm">Size: {item.size}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.cartId!, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId!, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartId!)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal}</span>
              </div>
              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessingPayment || state.items.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-md hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Checkout with Stripe
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
                {paymentError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {paymentError}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}