import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import ShoeLayout from '../../components/ShoeLayout';
import { Link } from 'react-router-dom';


export default function MensApparel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Get men's apparel category ID
        const { data: categories } = await supabase
          .from('product_categories')
          .select('id')
          .ilike('name', '%Men%Apparel%')
          .limit(1);

        if (!categories || categories.length === 0) {
          // Fallback to any men's category
          const { data: menCategories } = await supabase
            .from('product_categories')
            .select('id')
            .ilike('name', 'Men%')
            .limit(1);
            
          if (!menCategories || menCategories.length === 0) {
            throw new Error('Men\'s category not found');
          }
          
          // Fetch products from men's category
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
            .eq('category_id', menCategories[0].id)
            .order('created_at', { ascending: false })
            .limit(8);

          if (error) throw error;
          setProducts(data || []);
          return;
        }

        // Fetch products from men's apparel category
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
          .eq('category_id', categories[0].id)
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
        title="Men's Apparel & Accessories"
        description="Loading our men's apparel collection..."
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
            <h1 className="text-3xl font-bold mb-4">No Products Found</h1>
            <p className="text-gray-600 mb-6">
              {error || "We couldn't find any products in this category. Please check back later."}
            </p>
            <Link to="/category/men" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
              Browse Men's Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShoeLayout
      products={products}
      title="Men's Apparel & Accessories"
      description="Complete your look with our collection of sustainable apparel and accessories. From organic cotton tees to merino wool socks, every piece is designed for comfort and made with the planet in mind."
      loading={loading}
      error={error}
    />
  );
}