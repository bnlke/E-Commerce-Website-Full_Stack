import ShoeLayout from '../../components/ShoeLayout';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Link } from 'react-router-dom';


export default function KidsActiveSneakers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Get kids' active sneakers category ID
        const { data: categories } = await supabase
          .from('product_categories')
          .select('id')
          .ilike('name', '%Kids%Active%')
          .limit(1);

        if (!categories || categories.length === 0) {
          // Fallback to any kids' category
          const { data: kidsCategories } = await supabase
            .from('product_categories')
            .select('id')
            .ilike('name', 'Kids%')
            .limit(1);
            
          if (!kidsCategories || kidsCategories.length === 0) {
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
            .eq('category_id', kidsCategories[0].id)
            .order('created_at', { ascending: false })
            .limit(8);

          if (error) throw error;
          setProducts(data || []);
          return;
        }

        // Fetch products from kids' active sneakers category
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
        title="Kids' Active Sneakers"
        description="Loading our kids' active sneakers collection..."
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
      title="Kids' Active Sneakers"
      description="Performance sneakers designed for young athletes. Features include extra support, durable materials, and comfortable fit for all kinds of sports and activities."
      loading={loading}
      error={error}
    />
  );
}