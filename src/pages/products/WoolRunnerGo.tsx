import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext'; 
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, HeartOff } from 'lucide-react';
import SizeChart from '../../components/SizeChart';
import { getSizeGuide } from '../../utils/sizeCharts';
import ImageWithFallback from '../../components/ImageWithFallback';
import { supabase } from '../../lib/supabase';
import BuyButton from '../../components/BuyButton';
import { Product } from '../../types';

interface ProductSize {
  size: string;
  stock_quantity: number;
}

export default function WoolRunnerGo() {
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { dispatch } = useCart();
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites(); 
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            product_categories (
              name
            )
          `)
          .eq('slug', 'nike-air-force-1')
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // Fetch product sizes
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('size, stock_quantity')
          .eq('product_id', productData.id)
          .order('size');

        if (sizesError) throw sizesError;
        setSizes(sizesData || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, []);

  const isFavorite = product ? favoritesState.items.some(item => item.id === product.id) : false;

  const toggleFavorite = () => {
    if (!product) return;

    if (isFavorite) {
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
  };

  const sizeGuide = getSizeGuide('shoes');

  const addToCart = () => {
    if (!selectedSize || !product) return;
    
    // Get current size stock
    const sizeStock = sizes.find(s => s.size === selectedSize);
    if (!sizeStock || sizeStock.stock_quantity <= 0) return;

    // Update stock in Supabase
    supabase.rpc('increment_stock', {
      p_product_id: product.id,
      p_size: selectedSize,
      p_quantity: -1
    });

    // Update local state
    setSizes(prevSizes => 
      prevSizes.map(size => 
        size.size === selectedSize 
          ? { ...size, stock_quantity: size.stock_quantity - 1 }
          : size
      )
    );

    // Create a product object with the selected size
    const productWithSize = {
      ...product,
      size: selectedSize
    };
    
    dispatch({ 
      type: 'ADD_ITEM',
      payload: productWithSize
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-36 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl mb-6">${product.price}</p>
            
            {/* Tags */}
            <div className="mb-6 flex flex-wrap gap-2">
              {product.tags?.map((tag) => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-gray-600 mb-8">{product.description}</p>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Features</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold">Premium Quality</h3>
                  <p className="text-gray-600">Made with high-quality materials for durability and style</p>
                </div>
                <div>
                  <h3 className="font-bold">Comfort</h3>
                  <p className="text-gray-600">Designed for all-day comfort and support</p>
                </div>
                <div>
                  <h3 className="font-bold">Style</h3>
                  <p className="text-gray-600">Classic design that never goes out of fashion</p>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">SIZE:</h2>
                <button 
                  onClick={() => setShowSizeGuide(!showSizeGuide)} 
                  className="text-sm underline"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map(({ size, stock_quantity }) => (
                  <button
                    key={size}
                    onClick={() => stock_quantity > 0 && setSelectedSize(size === selectedSize ? '' : size)}
                    disabled={stock_quantity <= 0}
                    className={`py-3 border rounded-md text-sm font-medium transition-colors relative
                      ${selectedSize === size
                        ? 'border-black bg-black text-white' 
                        : stock_quantity > 0
                          ? 'border-gray-300 hover:border-gray-900'
                          : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    EU {size}
                    {stock_quantity === 0 && (
                      <span className="absolute -top-2 -right-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                        Sold Out
                      </span>
                    )}
                    {stock_quantity > 0 && stock_quantity <= 3 ? (
                      <span className="absolute -top-2 -right-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                        {stock_quantity} left
                      </span>
                    ) : stock_quantity > 3 && stock_quantity <= 10 ? (
                      <span className="absolute -top-2 -right-2 text-xs bg-yellow-100 text-yellow-600 px-1 rounded">
                        Low Stock
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size Guide */}
            {showSizeGuide && sizeGuide && (
              <SizeChart sizeChart={sizeGuide} />
            )}

            {/* Add to Cart and Favorites */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={addToCart}
                disabled={!selectedSize}
                className="flex-1 bg-black text-white py-4 rounded-md font-medium hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mr-2"
              >
                Add to Cart
              </button>
              <BuyButton
                priceId="price_1RH2xJFaEHaNHSEDF9MtttVu"
                mode="payment"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!selectedSize}
              >
                Buy Now
              </BuyButton>
              <button 
                onClick={toggleFavorite}
                className={`p-4 border rounded-md transition-colors ${
                  isFavorite 
                    ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                    : 'border-gray-300 hover:border-gray-900'
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <HeartOff className="w-5 h-5 text-red-500" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Favorites Info */}
            {!user && (
              <div className="mt-4 text-sm text-gray-500 italic">
                <p>Not signed in? Favorites will be saved for 1 hour. <Link to="/login" className="underline font-medium">Sign in</Link> to save them permanently.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}