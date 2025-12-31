
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define what a Cart Item looks like
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Calculate Total Price
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === newItem.id && item.size === newItem.size);
      if (existing) {
        return prev.map(item => 
          item.id === newItem.id && item.size === newItem.size 
          ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true); // Automatically open cart when item is added
  };

  const removeFromCart = (id: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isCartOpen, setIsCartOpen, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};