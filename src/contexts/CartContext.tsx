import { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { Product } from '../types';

export interface CartItem extends Product {
  quantity: number;
  size: string;
  cartId?: string; // Unique identifier for cart items
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string } // cartId
  | { type: 'UPDATE_QUANTITY'; payload: { cartId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case 'ADD_ITEM': {
      // Generate a unique cart ID for this item
      const cartId = `${action.payload.id}-${action.payload.size}-${Date.now()}`;
      
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.size === action.payload.size
      );
      
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item => {
            if (item.id === action.payload.id) {
              return { ...item, quantity: item.quantity + 1, cartId: item.cartId || cartId };
            }
            return item;
          }),
          total: state.total + action.payload.price
        };
        break;
      }

      newState = {
        ...state,
        items: [...state.items, { 
          ...action.payload,
          quantity: 1,
          size: action.payload.size || 'One Size',
          cartId
        }],
        total: state.total + action.payload.price
      };
      break;
    }

    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.cartId === action.payload);
      if (!item) return state;

      newState = {
        ...state,
        items: state.items.filter(item => item.cartId !== action.payload),
        total: state.total - (item.price * item.quantity)
      };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.cartId === action.payload.cartId);
      if (!item) return state;

      const quantityDiff = action.payload.quantity - item.quantity;

      newState = {
        ...state,
        items: state.items.map(item =>
          item.cartId === action.payload.cartId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff)
      };
      break;
    }

    case 'CLEAR_CART':
      newState = {
        items: [],
        total: 0
      };
      // Ensure localStorage is also cleared
      localStorage.setItem('cart', JSON.stringify(newState));
      break;

    default:
      return state;
  }

  // Save to localStorage
  localStorage.setItem('cart', JSON.stringify(newState));
  return newState;
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const initialState = JSON.parse(localStorage.getItem('cart') || JSON.stringify({
    items: [],
    total: 0
  }));

  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  // Use a more efficient approach to save to localStorage
  useEffect(() => {
    // Debounce localStorage updates to improve performance
    const timeoutId = setTimeout(() => {
      localStorage.setItem('cart', JSON.stringify(state));
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [state]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}