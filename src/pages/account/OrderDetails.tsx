import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Package, Truck, Calendar, CreditCard, MapPin, AlertCircle, CheckCircle, ShoppingBag, Loader, ArrowRight } from 'lucide-react';

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

interface ShippingAddress {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface PaymentDetails {
  id: string;
  card_type: string;
  last_four: string;
  expiry_date: string;
  cardholder_name: string;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  payment_method_id?: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: string;
  payment_details: PaymentDetails;
  tracking_number?: string;
  estimated_delivery?: string;
  delivery_notes?: string;
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsCount, setItemsCount] = useState(0);

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (!id || id === 'undefined') {
          setError('Order ID is missing');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase.rpc('get_order_by_id', { 
          p_order_id: id 
        });
        
        if (error) {
          console.error('Error from RPC call:', error);
          throw error;
        }
        
        console.log('Order data received:', data);
        
        if (data && Array.isArray(data) && data.length > 0) {          
          const orderData = data[0];
          setOrder(orderData);
          
          // Calculate total items count
          if (orderData.items && Array.isArray(orderData.items)) {
            const totalItems = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
            setItemsCount(totalItems);
          }
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 animate-spin text-gray-700 mb-4" />
              <p className="text-gray-600">Loading your order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-36 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg flex items-start mb-6">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-2">Error</h3>
              <p>{error || 'Failed to load order details'}</p>
              <Link to="/account/orders" className="mt-4 inline-flex items-center text-red-600 hover:text-red-800 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-36 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg flex items-start mb-6">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-2">Order Not Found</h3>
              <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
              <Link to="/account/orders" className="mt-4 inline-flex items-center text-red-600 hover:text-red-800 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen pt-36 pb-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link to="/account/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Order History
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Order Header with Status */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(0, 8)}</h1>
                <p className="text-gray-500">Placed on {formatDate(order.created_at)}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.toLowerCase() === 'completed' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Order Confirmation Banner */}
          <div className="p-6 bg-green-50 border-b border-green-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-green-800">Order Confirmed</h2>
                <p className="text-green-700">Thank you for your purchase! Your order has been received{order.status === 'completed' ? ' and completed' : ' and is being processed'}.</p>
              </div>
            </div>
          </div>

          {/* Order Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items Section - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order Items
                </h2>
                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item: OrderItem) => (
                      <div key={item.id} className="p-4 flex flex-col sm:flex-row">
                        <div className="flex-shrink-0 sm:mr-6 mb-4 sm:mb-0">
                          <img
                            className="h-24 w-24 rounded-md object-cover object-center mx-auto sm:mx-0"
                            src={item.product?.image_url || `https://via.placeholder.com/96?text=${encodeURIComponent(item.product?.name || 'Product')}`}
                            alt={item.product?.name || 'Product'}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://via.placeholder.com/96?text=${encodeURIComponent(item.product?.name || 'Product')}`;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          {/* Product Details */}
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                              {item.product?.slug ? (
                                <Link to={`/product/${item.product.slug}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                                View Product
                                </Link>
                              ) : null}
                              {(item.size || item.product?.size) && (
                                <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                              )}
                            </div>
                            <div className="mt-2 sm:mt-0 text-right">
                              <p className="text-lg font-medium">${(item.price_at_time * item.quantity).toFixed(2)}</p>
                              <p className="text-sm text-gray-500">${item.price_at_time.toFixed(2)} × {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 border-t">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})</span>
                        <span>${order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar with Shipping and Payment Info */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Shipping Information */}
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Shipping Information
                    </h2>
                    {order.shipping_address ? (
                      <div>
                        <p className="font-medium">{order.shipping_address.name}</p>
                        <p>{order.shipping_address.address_line1}</p>
                        {order.shipping_address.address_line2 && (
                          <p>{order.shipping_address.address_line2}</p>
                        )}
                        <p>
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                        </p>
                        <p>{order.shipping_address.country}</p>
                        {order.shipping_address.phone && (
                          <p className="mt-2">{order.shipping_address.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No shipping information available</p>
                    )}
                    
                    {/* Tracking Information */}
                    {order.tracking_number && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Tracking Information
                        </h3>
                        <p>
                          <span className="font-medium">Tracking Number:</span> {order.tracking_number}
                        </p>
                        {order.estimated_delivery && (
                          <p className="mt-2">
                            <span className="font-medium">Estimated Delivery:</span> {formatDate(order.estimated_delivery)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Payment Information */}
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Payment Information
                    </h2>
                    {order.payment_details ? (
                      <div>
                        <p>
                          <span className="font-medium">Payment Method:</span> {order.payment_details.card_type ? 
                            `${order.payment_details.card_type.charAt(0).toUpperCase() + order.payment_details.card_type.slice(1)} ending in ${order.payment_details.last_four}` : 
                            order.payment_method || 'Credit Card'}
                        </p>
                        {order.payment_details.cardholder_name && <p className="mt-2">
                          <span className="font-medium">Cardholder:</span> {order.payment_details.cardholder_name}
                        </p>}
                        {order.payment_details.expiry_date && <p className="mt-2">
                          <span className="font-medium">Expiry:</span> {order.payment_details.expiry_date}
                        </p>}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        <span className="font-medium">Payment Method:</span> {order.payment_method || 'Credit Card'}
                      </p>
                    )}
                  </div>
                  
                  {/* Need Help? */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      If you have any questions about your order, please contact our customer support.
                    </p>
                    <Link 
                      to="/help" 
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    > 
                      <span>Visit Help Center</span>
                      <ArrowLeft className="w-4 h-4 ml-1 transform rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}