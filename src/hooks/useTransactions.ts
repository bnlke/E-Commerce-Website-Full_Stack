import { useState } from 'react';
import { CartState } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: string;
  items: CartState['items'];
  total: number;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  const createTransaction = (cartState: CartState): Promise<Transaction> => {
    return new Promise((resolve, reject) => {
      // Create a real transaction in the database
      const processTransaction = async () => {
        try {
          if (!user) {
            throw new Error('User must be logged in to create an order');
          }

          // Get default address
          const { data: addressData, error: addressError } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_default', true)
            .single();

          if (addressError && !addressError.message.includes('No rows found')) {
            throw addressError;
          }

          // Create order
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
              {
                user_id: user.id,
                total_amount: cartState.total,
                status: 'pending',
                shipping_address_id: addressData?.id || null,
                payment_method: 'Credit Card'
              }
            ])
            .select()
            .single();

          if (orderError) throw orderError;

          // Create order items
          const orderItems = cartState.items.map(item => ({
            order_id: orderData.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_time: item.price
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;

          // Create transaction object for state
          const transaction: Transaction = {
            id: orderData.id,
            items: [...cartState.items],
            total: cartState.total,
            status: 'completed',
            date: new Date()
          };

          setTransactions(prev => [...prev, transaction]);
          resolve(transaction);
        } catch (error) {
          console.error('Transaction error:', error);
          reject(error);
        }
      };

      processTransaction();
    });
  };

  const updateTransactionStatus = (
    transactionId: string,
    status: Transaction['status']
  ) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === transactionId
          ? { ...transaction, status }
          : transaction
      )
    );
  };

  return {
    transactions,
    createTransaction,
    updateTransactionStatus
  };
}