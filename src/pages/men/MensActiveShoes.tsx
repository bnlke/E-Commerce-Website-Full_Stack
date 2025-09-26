import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import ShoeLayout from '../../components/ShoeLayout';

export default function MensActiveShoes() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data: categories } = await supabase
          .from('product_categories')
          .select('id')
          .eq('name', 'Men\'s Active Shoes')
          .single();

        if (!categories?.id) {
          throw new Error('Category not found');
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categories.id);

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

  return (
    <ShoeLayout
      products={products}
      title="Men's Active Shoes"
      description="High-performance shoes designed for your active lifestyle. From running to training, find your perfect workout companion." 
      loading={loading}
      error={error}
    />
  );
}