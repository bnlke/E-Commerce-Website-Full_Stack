import { ShoppingCart } from 'lucide-react';
import { Heart, HeartOff } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import ImageWithFallback from './ImageWithFallback';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCallback } from 'react';

interface ProductGridProps {
  products: Product[];
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
}

export default function ProductGrid({ products, title, description, loading, error }: ProductGridProps) {
  const { dispatch } = useCart();
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites();
  const { user } = useAuth();
  const [localProducts, setProducts] = useState<Product[]>([]);
  const [localError, setError] = useState<string | null>(error || null);
  const [isLoading, setIsLoading] = useState(loading || false);

  useEffect(() => {
    // Use the products passed as props instead of fetching again
    setProducts(products || []);
    setError(error || null);
    setIsLoading(loading || false);
  }, [products, error, loading]);

  // Memoize the addToCart function to prevent unnecessary re-renders
  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  }, [dispatch]);

  // Memoize the toggleFavorite function
  const toggleFavorite = useCallback((product: Product) => {
    if (favoritesState.items.some(item => item.id === product.id)) {
      favoritesDispatch({ type: 'REMOVE_FAVORITE', payload: product.id });
      // Show feedback for logged-in users
      if (user) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in';
        toast.textContent = 'Removed from favorites';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('animate-fade-out');
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
      }
    } else {
      favoritesDispatch({ type: 'ADD_FAVORITE', payload: product });
      // Show feedback for logged-in users
      if (user) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in';
        toast.textContent = 'Added to favorites';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('animate-fade-out');
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
      }
    }
  }, [favoritesState.items, favoritesDispatch, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {localError}
      </div>
    );
  }

  return (
    <div className="px-6 overflow-hidden">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      {description && products.length > 0 && (
        <p className="text-gray-600 mb-6 max-w-3xl">{description}</p>
      )}
      {!isLoading && localProducts.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any products in this category. Please check back later or browse our other collections.
          </p>
          <Link to={`/category/accessories`} className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
            Browse All Accessories
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-8">
        {localProducts.map((product, index) => (
          <div key={product.id} className="group relative">
            <Link to={`/product/${product.slug || `product-${product.id}`}`} className="block">
              <div className="relative overflow-hidden rounded-lg mb-2">
                <ImageWithFallback
                  src={product.image_url || 'https://via.placeholder.com/400'}
                  alt={product.name}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={index < 4}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(product);
                  }}
                  className={`absolute top-2 right-2 p-2 rounded-full ${
                    favoritesState.items.some(item => item.id === product.id)
                      ? 'bg-red-50 text-red-500'
                      : 'bg-white text-gray-400 hover:text-gray-600'
                  } transition-colors`}
                >
                  {favoritesState.items.some(item => item.id === product.id) ? (
                    <HeartOff className="w-5 h-5" />
                  ) : (
                    <Heart className="w-5 h-5" />
                  )}
                </button>
              </div>
              <h3 className="text-sm font-medium mb-1">{product.name}</h3>
            </Link>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}