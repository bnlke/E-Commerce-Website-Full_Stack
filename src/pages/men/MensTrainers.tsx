import ShoeLayout from '../../components/ShoeLayout';
import { useProducts } from '../../hooks/useProducts';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Link } from 'react-router-dom';

export default function MensTrainers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Get men's trainers category ID
        const { data: categories } = await supabase
          .from('product_categories')
          .select('id')
          .ilike('name', '%Men%Trainers%')
          .limit(1);

        if (!categories || categories.length === 0) {
          throw new Error('Men\'s Trainers category not found');
        }

        // Fetch products from men's trainers category
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

  return (
    <ShoeLayout
      products={products}
      title="Men's Trainers"
      description="Discover our collection of comfortable and stylish trainers designed specifically for men. Each pair combines fashion with function, perfect for both active lifestyles and casual wear."
      loading={loading}
      error={error}
    />
  );
}