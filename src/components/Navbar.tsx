import { useState, useRef, useEffect } from 'react';
import { ShoppingBag, User, Search, X, HelpCircle, Menu, Heart, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import PromotionalBanner from './PromotionalBanner';
import Cart from './Cart';
import SubBanner from './SubBanner';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SearchResults from './SearchResults';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const scrollPosition = useScrollPosition();
  const searchRef = useRef<HTMLDivElement>(null);
  const { searchQuery, setSearchQuery, setIsSearching } = useSearch();
  const { state } = useCart();
  const { state: favoritesState } = useFavorites();
  const { user, profile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Memoize admin check to avoid unnecessary database calls
  useEffect(() => {
    let isMounted = true;
    
    async function checkAdminStatus() {
      if (!user) return;
      try {
        const { data } = await supabase.rpc('is_admin');
        if (isMounted) {
          setIsAdmin(data);
        }
      } catch (error) {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    }
    checkAdminStatus();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    // Improved click outside handler with proper cleanup
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoize cart item count for better performance
  const cartItemCount = useMemo(() => {
    return state.items.reduce((acc, item) => acc + item.quantity, 0);
  }, [state.items]);

  // Memoize favorites count
  const favoritesCount = useMemo(() => {
    return favoritesState.items.length;
  }, [favoritesState.items]);

  // Handle search input with debounce
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(value.length > 0);
  }, [setSearchQuery, setIsSearching]);

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white shadow-sm">
      <PromotionalBanner />
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex items-center space-x-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex space-x-6">
              <Link to="/category/men" className="nav-link">Men</Link>
              <Link to="/category/women" className="nav-link">Women</Link>
              <Link to="/category/kids" className="nav-link">Kids</Link>
              <Link to="/category/socks" className="nav-link">Socks</Link>
              <Link to="/category/accessories" className="nav-link">Accessories</Link>
              <Link to="/sale" className="nav-link text-red-600 hover:text-red-700">Sale</Link>
            </div>
          </div>

          <Link 
            to="/" 
            className="logo flex items-center space-x-1"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
          >
            <span>Wear</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">X</span>
            <span>press</span>
          </Link>

          <div className="flex-1 flex items-center justify-end space-x-6">
            <div ref={searchRef} className="flex items-center overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search..."
                className={`px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-500 ease-in-out transform ${
                  isSearchOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full p-0 border-0'
                }`}
              />
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`hover:text-gray-600 transition-all duration-500 p-2 rounded-full hover:bg-gray-100 ${
                  isSearchOpen ? '-ml-2' : ''
                }`}
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
            <Link 
              to="/login" 
              className="hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              title="Sign In"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-medium">
                        {profile?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                title="Admin Dashboard"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
            <button 
              className="hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              onClick={() => navigate('/help')}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <Link 
              to="/favorites" 
              className="hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 relative"
              title="Favorites"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 relative"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-8">
              <Link to="/" className="logo">
                <span>Wear</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">X</span>
                <span>press</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Categories</h3>
                <div className="space-y-4">
                  <Link 
                    to="/category/men" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Men
                  </Link>
                  <Link 
                    to="/category/women" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Women
                  </Link>
                  <Link 
                    to="/category/kids" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Kids
                  </Link>
                  <Link 
                    to="/category/socks" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Socks
                  </Link>
                  <Link 
                    to="/category/accessories" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Accessories
                  </Link>
                  <Link 
                    to="/sale" 
                    className="block text-lg font-medium text-red-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sale
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Account</h3>
                <div className="space-y-4">
                  <Link 
                    to="/login" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                  <Link 
                    to="/help" 
                    className="block text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Help
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
      
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}
      <SearchResults />
      <div className={`transition-all duration-300 ${scrollPosition > 50 ? 'h-0 opacity-0 overflow-hidden' : 'h-10 opacity-100'}`}>
        <SubBanner />
      </div>
    </nav>
  );
}