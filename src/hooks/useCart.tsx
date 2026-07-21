import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem } from '../features/types';

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  isExpired: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_EXPIRATION_TIME = 10 * 60 * 1000; // 10 minutos

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem('ticketwave_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        return { items: [], total: 0 };
      }
      return parsed;
    }
    return { items: [], total: 0 };
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    localStorage.setItem('ticketwave_cart', JSON.stringify(cart));
    
    if (cart.items.length > 0 && cart.expiresAt) {
      const timer = setTimeout(() => {
        setIsExpired(true);
        clearCart();
      }, cart.expiresAt - Date.now());
      return () => clearTimeout(timer);
    }
  }, [cart]);

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const addItem = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.items.find(i => i.id === item.id);
      let newItems;
      if (existing) {
        newItems = prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      } else {
        newItems = [...prev.items, item];
      }
      
      const newExpiresAt = prev.items.length === 0 ? Date.now() + CART_EXPIRATION_TIME : prev.expiresAt;
      
      return {
        items: newItems,
        total: calculateTotal(newItems),
        expiresAt: newExpiresAt
      };
    });
    setIsExpired(false);
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(i => i.id !== id);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        expiresAt: newItems.length === 0 ? undefined : prev.expiresAt
      };
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev => {
      const newItems = prev.items.map(i => i.id === id ? { ...i, quantity } : i);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        expiresAt: prev.expiresAt
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
    setIsExpired(false);
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, clearCart, updateQuantity, isExpired }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
