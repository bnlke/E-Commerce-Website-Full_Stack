import { useSubscription } from '../hooks/useSubscription';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { stripeProducts } from '../stripe-config';

export default function SubscriptionStatus() {
  const { subscription, isSubscribed, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="w-5 h-5 animate-spin text-gray-500 mr-2" />
        <span className="text-gray-500">Loading subscription status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>Error loading subscription: {error}</p>
      </div>
    );
  }

  // Find the product that matches the subscription's price_id
  const subscribedProduct = subscription?.price_id 
    ? stripeProducts.find(product => product.priceId === subscription.price_id)
    : null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      {isSubscribed ? (
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Active Subscription</h3>
            {subscribedProduct && (
              <p className="text-gray-600 text-sm">
                You're subscribed to: {subscribedProduct.name}
              </p>
            )}
            {subscription?.current_period_end && (
              <p className="text-gray-600 text-sm">
                Next billing date: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </p>
            )}
            {subscription?.payment_method_last4 && (
              <p className="text-gray-600 text-sm">
                Payment method: {subscription.payment_method_brand?.toUpperCase()} ending in {subscription.payment_method_last4}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start">
          <XCircle className="w-5 h-5 text-gray-400 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium">No Active Subscription</h3>
            <p className="text-gray-600 text-sm mb-3">
              You don't have an active subscription.
            </p>
            <Link 
              to="/"
              className="text-sm bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800 transition-colors inline-block"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}