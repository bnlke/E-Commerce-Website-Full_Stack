import { supabase } from '../lib/supabase';

// Cache for search results
const searchCache: Record<string, {
  timestamp: number;
  results: Product[];
}> = {};

// Cache expiration time (2 minutes)
const SEARCH_CACHE_EXPIRATION = 2 * 60 * 1000;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  slug?: string;
  tags?: string[];
  stock_quantity: number;
  stock_status: string;
  category_id: string;
  image_url: string;
  product_categories?: {
    name: string;
  };
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Normalize query for caching
    const normalizedQuery = query.trim().toLowerCase();
    
    // Return cached results if available and fresh
    const cached = searchCache[normalizedQuery];
    if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_EXPIRATION) {
      return cached.results;
    }
    
    // Use full-text search for better performance
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        image_url,
        stock_status,
        slug,
        category_id,
        product_categories (
          name
        )
      `)
      .or(`name.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`)
      .limit(20);

    if (error) throw error;
    
    const results = data || [];
    
    // Cache the results
    searchCache[normalizedQuery] = {
      timestamp: Date.now(),
      results
    };
    
    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // Use a more efficient query with pagination
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        image_url,
        stock_status,
        slug,
        category_id,
        product_categories (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    // Check if we have the product in any cache first
    for (const key in searchCache) {
      const product = searchCache[key].results.find(p => p.slug === slug);
      if (product && Date.now() - searchCache[key].timestamp < SEARCH_CACHE_EXPIRATION) {
        return product;
      }
    }
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        description,
        image_url,
        stock_status,
        slug,
        category_id,
        product_categories (
          name
        )
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export default [];