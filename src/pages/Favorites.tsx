import { Heart } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import ProductGrid from '../components/ProductGrid';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const { state, dispatch } = useFavorites();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up expired items when viewing favorites
    dispatch({ type: 'CLEANUP_EXPIRED' });
    setIsLoading(false);
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-36 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {user 
              ? "Items will remain in your favorites until you remove them." 
              : "Items will remain in your favorites for 1 hour. Sign in to keep them permanently."}
          </p>
          {!user && (
            <div className="mt-4">
              <Link to="/login" className="text-black underline font-medium">
                Sign in to save your favorites
              </Link>
            </div>
          )}
        </div>
        
        {state.items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-gray-600">
              Start adding items to your favorites by clicking the heart icon on products
            </p>
            <Link to="/" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <ProductGrid
            products={state.items}
            title={`My Favorites (${state.items.length})`}
            description="Your collection of favorite items. Click the heart icon to remove items."
          />
        )}
      </div>
    </div>
  );
}