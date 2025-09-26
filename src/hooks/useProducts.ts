import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Cache for products by category
const productCache: Record<string, {
  timestamp: number;
  data: Product[];
}> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export function useProducts(categoryName: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have cached data that's still valid
    const cached = productCache[categoryName];
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
      setProducts(cached.data);
      setLoading(false);
      return;
    }
    
    async function fetchProducts() {
      try {
        setLoading(true);
        
        const { data: categories } = await supabase
          .from('product_categories')
          .select('id')
          .eq('name', categoryName)
          .limit(1)
          .single();

        if (!categories?.id) {
          throw new Error('Category not found');
        }

        // Use count option to avoid fetching unnecessary data
        const { data, error, count } = await supabase
          .from('products')
          .select(`
            *,
            product_categories (
              name
            )
          .select(`
            id,
            name,
            price,
            description,
            image_url,
            stock_status,
            slug,
            category_id
          )
          `, { count: 'exact' })
          .eq('category_id', categories.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const productsData = data || [];
        
        // Cache the results
        productCache[categoryName] = {
          timestamp: Date.now(),
          data: productsData
        };
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryName]);

  return { products, loading, error };
}
      }
    }
  }
  )
}