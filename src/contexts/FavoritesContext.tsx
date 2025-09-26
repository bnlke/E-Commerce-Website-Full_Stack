// Hooks and types
import { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { Product } from '../types';

// Types
interface FavoriteItem extends Product {
  addedAt: number;
}

interface FavoritesState {
  items: FavoriteItem[];
}

type FavoritesAction =
  | { type: 'ADD_FAVORITE'; payload: Product }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'CLEANUP_EXPIRED' }
  | { type: 'LOAD_FAVORITES'; payload: FavoriteItem[] };

// Context
const FavoritesContext = createContext<{
  state: FavoritesState;
  dispatch: React.Dispatch<FavoritesAction>;
} | null>(null);

// Constants - different expiry times based on auth status
const LOGGED_IN_EXPIRY = Number.MAX_SAFE_INTEGER; // Effectively no expiry for logged-in users
const GUEST_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds
const STORAGE_KEY = 'favorites';

// Reducer
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  let newState: FavoritesState;

  switch (action.type) {
    case 'ADD_FAVORITE':
      if (state.items.find(item => item.id === action.payload.id)) {
        return state;
      }
      newState = {
        ...state,
        items: [...state.items, { ...action.payload, addedAt: Date.now() }]
      };
      break;

    case 'REMOVE_FAVORITE':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      break;

    case 'CLEANUP_EXPIRED':
      const now = Date.now();
      // Get the appropriate expiry time based on auth status
      const expiryTime = localStorage.getItem('user') ? LOGGED_IN_EXPIRY : GUEST_EXPIRY;
      
      // Filter out expired items
      newState = {
        ...state,
        items: state.items.filter(item => (now - item.addedAt) < expiryTime)
      };
      break;

    case 'LOAD_FAVORITES':
      newState = {
        ...state,
        items: action.payload
      };
      break;

    default:
      return state;
  }

  // Save to localStorage after state changes
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

// Provider Component
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: []
  });

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem(STORAGE_KEY);
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        dispatch({ type: 'LOAD_FAVORITES', payload: parsedFavorites.items });
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Set up cleanup interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const expiryTime = localStorage.getItem('user') ? LOGGED_IN_EXPIRY : GUEST_EXPIRY;
      dispatch({ type: 'CLEANUP_EXPIRED' });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}