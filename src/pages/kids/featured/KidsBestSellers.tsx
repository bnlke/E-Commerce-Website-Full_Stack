import ShoeLayout from '../../../components/ShoeLayout';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product } from '../../../types';
import { Link } from 'react-router-dom';


export default function KidsBestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Get kids' category ID
        const { data: categories } = await supabase
          .from('product_categories')
          .select('id')
          .ilike('name', 'Kids%')
          .limit(1);

        if (!categories || categories.length === 0) {
          throw new Error('Kids\' category not found');
        }

        // Fetch products from kids' category
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
          .order('created_at', { ascending: false })
          .limit(10);

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
        title="Kids' Best Sellers"
        description="Loading our most-loved kids' styles..."
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
            <Link to="/category/kids" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
              Browse Kids' Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShoeLayout
      products={products}
      title="Kids' Best Sellers"
      description="Our most popular kids' shoes loved by parents and children alike. Tried, tested, and highly rated by our community."
      loading={loading}
      error={error}
    />
  );
}