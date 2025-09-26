import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  size?: string;
  product: {
    name: string;
    image_url: string;
    slug: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      ensureAllStripeOrdersSynced();
      
      // Check for message in localStorage
      const orderMessage = localStorage.getItem('orderMessage');
      if (orderMessage) {
        setError(orderMessage);
        localStorage.removeItem('orderMessage');
      }
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_user_orders');
      
      if (error) throw error;
      
      if (data) {
        console.log('Orders fetched:', data);
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const ensureAllStripeOrdersSynced = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the function to ensure all Stripe orders are synced
      const { error } = await supabase.rpc('ensure_all_stripe_orders_synced');
      
      if (error) {
        throw error;
      }
      
      // Fetch orders again to get the synced orders
      fetchOrders();
    } catch (err) {
      console.error('Error syncing all Stripe orders:', err);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}