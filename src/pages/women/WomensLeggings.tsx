import ShoeLayout from '../../components/ShoeLayout';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import BuyButton from '../../components/BuyButton';

export default function WomensLeggings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Try to get women's leggings category ID
        let { data: categories } = await supabase
          .from('product_categories')
          .select('*')
          .or('name.ilike.%Women%Leggings%,name.ilike.%Leggings%')
          .limit(5);

        if (!categories || categories.length === 0) {
          // Fallback to any women's category
          const { data: womenCategories } = await supabase
            .from('product_categories')
            .select('id')
            .ilike('name', 'Women%')
            .limit(1);
            
          if (!womenCategories || womenCategories.length === 0) {
            throw new Error('Women\'s category not found');
          }
          
          // Fetch products from women's category
          const { data, error } = await supabase
            .from('products')
            .select(`
              *,
              product_categories (
                name
              ),
              product_sizes (
                size,
                stock_quantity
              )
            `)
            .eq('category_id', womenCategories[0].id)
            .order('created_at', { ascending: false })
            .limit(8);

          if (error) throw error;
          setProducts(data || []);
          return;
        }

        // Find the most specific category (prefer "Women's Leggings" over just "Leggings")
        const leggingsCategory = categories.find(cat => 
          cat.name.toLowerCase().includes('women') && cat.name.toLowerCase().includes('leggings')
        ) || categories[0];

        // Fetch products from the selected leggings category
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_categories (
              name
            ),
            product_sizes (
              size,
              stock_quantity
            )
          `)
          .eq('category_id', leggingsCategory.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <ShoeLayout
        products={[]}
        title="Women's Leggings"
        description="Loading our women's leggings collection..."
        loading={loading}
        error={error}
      />
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen pt-36 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Woman Leggings</h1>
            <p className="text-gray-600 mb-6">Premium quality black leggings for maximum comfort</p>
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
                alt="Woman Leggings"
                className="w-full h-64 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-bold mb-2">Woman Leggings</h2>
              <p className="text-gray-700 mb-2">Black</p>
              <p className="text-xl font-bold mb-4">$45.00</p>
              
              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">SIZE:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                      className={`py-3 border rounded-md text-sm font-medium transition-colors
                        ${selectedSize === size 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 hover:border-gray-900'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <BuyButton
                priceId="price_1RH52oFaEHaNHSED0zoGdghm"
                mode="payment"
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-md font-medium hover:from-blue-600 hover:to-purple-700 transition-colors ${!selectedSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedSize}
              >
                Buy Now
              </BuyButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShoeLayout
      products={products}
      title="Women's Leggings"
      description="High-performance leggings designed for movement and comfort. Features moisture-wicking fabric and comfortable compression for all activities, from yoga to running."
      loading={loading}
      error={error}
    />
  );
}