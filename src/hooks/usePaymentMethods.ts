import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PaymentMethod {
  id: string;
  card_type: string;
  last_four: string;
  expiry_date: string;
  cardholder_name: string;
  is_default: boolean;
  created_at: string;
}

interface AddPaymentMethodData {
  card_type: string;
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
  is_default: boolean;
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (paymentData: AddPaymentMethodData) => {
    try {
      setError(null);
      
      // Extract last 4 digits from card number
      const last_four = paymentData.card_number.replace(/\s/g, '').slice(-4);
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // If setting as default, first update all existing methods to non-default
      if (paymentData.is_default) {
        const { error: updateError } = await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
          
        if (updateError) throw updateError;
      }
      
      // Insert payment method
      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: user.id,
          card_type: paymentData.card_type,
          last_four,
          expiry_date: paymentData.expiry_date,
          cardholder_name: paymentData.cardholder_name,
          is_default: paymentData.is_default
        }]);
      
      if (insertError) throw insertError;
      
      // Refresh payment methods
      await fetchPaymentMethods();
      return true;
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
      return false;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh payment methods
      await fetchPaymentMethods();
      return true;
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
      return false;
    }
  };

  const setDefaultPaymentMethod = async (id: string) => {
    try {
      setError(null);
      
      // Call the RPC function to set default payment method
      const { error } = await supabase
        .rpc('set_default_payment_method', { p_payment_id: id });
      
      if (error) throw error;
      
      // Refresh payment methods
      await fetchPaymentMethods();
      return true;
    } catch (err) {
      console.error('Error setting default payment method:', err);
      setError(err instanceof Error ? err.message : 'Failed to set default payment method');
      return false;
    }
  };

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod
  };
}