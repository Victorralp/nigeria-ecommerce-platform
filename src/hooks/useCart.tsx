import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/Product';
import { Cart, CartItem } from '@/types/Cart';
import { getCartItems, addToCart as addToCartDB, updateCartItemQuantity, removeFromCart as removeFromCartDB, clearCart as clearCartDB } from '@/services/cart';
import { toast } from 'react-hot-toast';
import { useAuth } from './useAuth';

const CartContext = createContext<Cart | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Load cart items from database when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadCartItems = async () => {
    try {
      console.log('Loading cart items...');
      setLoading(true);
      const cartItems = await getCartItems();
      console.log('Cart items loaded:', cartItems);
      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = useCallback((cartItems: CartItem[]) => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, []);

  const addItem = useCallback(async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      console.log('Adding item to cart:', product);
      const newItem = await addToCartDB(product.id);
      setItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => String(item.product_id) === String(product.id));
        if (existingItemIndex >= 0) {
          return prevItems.map((item, index) => 
            index === existingItemIndex ? newItem : item
          );
        }
        return [...prevItems, newItem];
      });
      toast.success(`Added ${product.name} to cart`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (cartItemId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to remove items from cart');
      return;
    }

    try {
      await removeFromCartDB(cartItemId);
      setItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update cart');
      return;
    }

    try {
      if (quantity > 0) {
        const updatedItem = await updateCartItemQuantity(cartItemId, quantity);
        setItems(prevItems => 
          prevItems.map(item => item.id === cartItemId ? updatedItem : item)
        );
      } else {
        await removeFromCartDB(cartItemId);
        setItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      toast.error('Failed to update quantity');
    }
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to clear cart');
      return;
    }

    try {
      await clearCartDB();
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  }, [isAuthenticated]);

  const total = calculateTotal(items);

  return (
    <CartContext.Provider value={{
      items,
      total,
      loading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 