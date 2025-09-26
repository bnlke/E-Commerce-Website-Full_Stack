import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { getSizeGuide } from '../utils/sizeCharts'; 
import { supabase } from '../lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizes, setSizes] = useState<{size: string, stock_quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const sizeGuide = getSizeGuide(product.category);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  useEffect(() => {
    async function fetchSizes() {
      try {
        // Check if product has sizes from Supabase
        if (product.product_sizes && product.product_sizes.length > 0) {
          // Use the sizes from the product object
          setSizes(product.product_sizes);
          setLoading(false);
          return;
        }

        // Otherwise fetch sizes from Supabase
        const { data, error } = await supabase
          .from('product_sizes')
          .select('size, stock_quantity')
          .eq('product_id', product.id)
          .order('size');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setSizes(data);
        } else {
          // Fallback to size guide if no sizes in database
          const guideSizes = sizeGuide?.rows.map(row => ({
            size: row[0].toString(),
            stock_quantity: 10 // Default stock
          })) || [{ size: 'One Size', stock_quantity: 10 }];
          
          setSizes(guideSizes);
        }
      } catch (err) {
        console.error('Error fetching sizes:', err);
        // Fallback to size guide
        const guideSizes = sizeGuide?.rows.map(row => ({
          size: row[0].toString(),
          stock_quantity: 10 // Default stock
        })) || [{ size: 'One Size', stock_quantity: 10 }];
        
        setSizes(guideSizes);
      } finally {
        setLoading(false);
      }
    }

    fetchSizes();
  }, [product, sizeGuide]);
  
  const addToCart = async () => {
    if (!selectedSize) return;
    
    // Get current size stock
    const sizeStock = sizes.find(s => s.size === selectedSize);
    if (!sizeStock || sizeStock.stock_quantity <= 0) return;

    try {
      // Update stock in Supabase
      const { error } = await supabase.rpc('increment_stock', {
        p_product_id: product.id,
        p_size: selectedSize,
        p_quantity: -1
      });

      if (error) throw error;

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
      
      dispatch({ type: 'ADD_ITEM', payload: productWithSize });
      onClose();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };
    
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-2xl mb-4">${product.price}</p>
            
            {product.tags && (
              <div className="mb-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-gray-600 mb-8">
              {product.slug === 'nike-air-force-1' 
                ? "The iconic Nike Air Force 1 features a timeless silhouette with premium leather upper, Air-Sole cushioning, and a durable rubber outsole. A streetwear legend that combines style, comfort, and durability for everyday wear."
                : product.description}
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">SIZE:</h3>
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
            
            <div className="space-y-4">
              <button
                onClick={addToCart}
                disabled={!selectedSize}
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}