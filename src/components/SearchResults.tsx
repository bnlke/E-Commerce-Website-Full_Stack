import { useState, useEffect } from 'react';
import { useSearch } from '../contexts/SearchContext';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { searchProducts } from '../utils/productData';
import { Product } from '../types';
import { useCallback, useMemo } from 'react';

export default function SearchResults() {
  const { searchQuery, isSearching, setIsSearching } = useSearch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Debounced search function to prevent too many API calls
  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setProducts([]);
      return;
    }
    
    // Don't search again if the query hasn't changed
    if (query === lastSearchQuery) return;
    
    setLoading(true);
    try {
      const results = await searchProducts(query);
      setProducts(results);
      setLastSearchQuery(query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [lastSearchQuery]);
  
  // Debounce search input
  useEffect(() => {
    if (!searchQuery) {
      setProducts([]);
      return;
    }
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce
    
    setDebounceTimeout(timeout);
    
    // Cleanup
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [searchQuery, performSearch, debounceTimeout]);

  // Memoize filtered products to avoid unnecessary re-renders
  // Moved before conditional return to maintain hooks order
  const filteredProducts = useMemo(() => {
    return products.slice(0, 20); // Limit to 20 results for better performance
  }, [products]);

  if (!isSearching) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="fixed top-24 inset-x-0 mx-auto max-w-2xl bg-white rounded-lg shadow-xl z-50 max-h-[70vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {loading ? (
              'Searching...'
            ) : (
              `${products.length} ${products.length === 1 ? 'result' : 'results'} for "${searchQuery}"`
            )}
          </h2>
          <button
            onClick={() => setIsSearching(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No products found matching your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  onClick={() => setIsSearching(false)}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={product.image_url || 'https://via.placeholder.com/80'}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-gray-600">${product.price}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span 
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {(product as any).product_categories?.name}
                        </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}