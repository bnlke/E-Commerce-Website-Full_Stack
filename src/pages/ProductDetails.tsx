import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, RotateCcw, HeartOff } from 'lucide-react';
import BuyButton from '../components/BuyButton';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { getSizeGuide, defaultSizeAvailability } from '../utils/sizeCharts';
import SizeChart from '../components/SizeChart';
import ImageWithFallback from '../components/ImageWithFallback';
import { Product, ProductSize } from '../types';
import { stripeProducts } from '../stripe-config';

interface ProductSize {
  size: string;
  stock_quantity: number;
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { dispatch } = useCart();
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites();
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const sizeGuide = product ? getSizeGuide(product.category) : null;
  
  // Memoize isFavorite calculation
  const isFavorite = useMemo(() => 
    product ? favoritesState.items.some(item => item.id === product.id) : false,
    [product, favoritesState.items]
  );
  
  // Find matching Stripe product
  const stripeProduct = product ? stripeProducts.find(sp => 
    sp.name.toLowerCase().includes(product.name.toLowerCase()) || 
    product.name.toLowerCase().includes(sp.name.toLowerCase())
  ) : null;
  
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!slug) {
          throw new Error('Product slug is required');
        }

        // Fetch product details with optimized query
        const { data: products, error: productError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            category_id,
            image_url,
            stock_status,
            slug,
            product_categories (
              name
            )
          `)
          .eq('slug', slug)
          .limit(1);

        if (productError) throw productError;
        
        if (!products || products.length === 0) {
          throw new Error('Product not found');
        }

        const productData = products[0];
        setProduct(productData);
        setCategory(productData.product_categories?.name || null);

        // Fetch product sizes with optimized query
        const { data: sizesData, error: sizesError } = await supabase
          .from('product_sizes')
          .select('size, stock_quantity')
          .eq('product_id', productData.id)
          .order('size')
          .limit(20);

        if (sizesError) throw sizesError;
        setSizes(sizesData || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  // Memoize addToCart function
  const addToCart = useCallback(async () => {
    if (!selectedSize || !product) return;
    
    // Get current size stock
    const sizeStock = sizes.find(s => s.size === selectedSize);
    if (!sizeStock || sizeStock.stock_quantity <= 0) return;

    try {
      // Use RPC function for better performance
      const { error } = await supabase.rpc('increment_stock', {
        p_product_id: product.id,
        p_size: selectedSize,
        p_quantity: -1
      });

      if (error) {
        console.error('Error updating stock:', error);
        return;
      }

      // Update local state
      setSizes(prevSizes => 
        prevSizes.map(size => 
          size.size === selectedSize 
            ? { ...size, stock_quantity: size.stock_quantity - 1 }
            : size
        )
      );

      // Add to cart
      dispatch({ 
        type: 'ADD_ITEM', 
        payload: { 
          ...product, 
          size: selectedSize 
        } 
      });
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  }, [selectedSize, product, sizes, dispatch]);

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

  if (loading) {
    return (
      <div className="pt-36 pb-12">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-36 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="text-black underline">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-36 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="text-black underline">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback
                src={product.image_url || 'https://via.placeholder.com/400'}
                alt={product.name}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl mb-6">${product.price}</p>

            {/* Category */}
            {category && <div className="mb-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {category}
              </span>
            </div>}
            
            <p className="text-gray-600 mb-6">{product.description}</p>

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
                    {size}
                    {stock_quantity === 0 ? (
                      <span className="absolute -top-2 -right-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                        Sold Out
                      </span>
                    ) : stock_quantity <= 3 ? (
                      <span className="absolute -top-2 -right-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                        {stock_quantity} left!
                      </span>
                    ) : stock_quantity <= 10 ? (
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

            {/* Add to Cart */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={addToCart}
                disabled={!selectedSize}
                className="flex-1 bg-black text-white py-4 rounded-md font-medium flex items-center justify-center space-x-2 hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mr-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Bag</span>
              </button>
              {stripeProduct && (
                <BuyButton
                  priceId={stripeProduct.priceId}
                  mode="payment"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                  disabled={!selectedSize}
                >
                  Buy Now
                </BuyButton>
              )}
              {product.name.toLowerCase().includes('leggings') && (
                <BuyButton
                  priceId="price_1RH52oFaEHaNHSED0zoGdghm"
                  mode="payment"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!selectedSize}
                >
                  Buy Now
                </BuyButton>
              )}
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
              <div className="mb-6 text-sm text-gray-500 italic">
                <p>Not signed in? Favorites will be saved for 1 hour. <Link to="/login" className="underline font-medium">Sign in</Link> to save them permanently.</p>
              </div>
            )}

            {/* Delivery Info */}
            <div className="space-y-4 border-t pt-8">
              <div className="flex items-start space-x-4">
                <Truck className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-sm text-gray-600">On orders over €50</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <RotateCcw className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-medium">Free Returns</p>
                  <p className="text-sm text-gray-600">100-day return policy</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t pt-8 mt-8">
              <h2 className="font-bold text-lg mb-4">Product Details</h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock_status === 'in_stock' 
                      ? 'bg-green-100 text-green-800'
                      : product.stock_status === 'low_stock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_status === 'in_stock' 
                      ? 'In Stock'
                      : product.stock_status === 'low_stock'
                      ? 'Low Stock'
                      : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}