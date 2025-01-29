import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/types/Product';
import { WishlistItem, getWishlistItems, addToWishlist as addToWishlistDB, removeFromWishlist as removeFromWishlistDB, isInWishlist as checkIsInWishlist } from '@/services/wishlist';
import { toast } from 'react-hot-toast';
import { useAuth } from './useAuth';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Load wishlist items when authenticated
  useEffect(() => {
    console.log('WishlistProvider auth state changed:', { isAuthenticated, userId: user?.id });
    if (isAuthenticated && user) {
      loadWishlistItems();
    } else {
      console.log('User not authenticated, clearing wishlist items');
      setItems([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadWishlistItems = async () => {
    try {
      console.log('Loading wishlist items...');
      setLoading(true);
      const wishlistItems = await getWishlistItems();
      console.log('Wishlist items loaded:', wishlistItems);
      setItems(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      toast.error('Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = useCallback(async (product: Product) => {
    if (!isAuthenticated) {
      console.log('Cannot add to wishlist: user not authenticated');
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      console.log('Adding item to wishlist:', product);
      const newItem = await addToWishlistDB(product.id);
      console.log('Item added to wishlist:', newItem);
      setItems(prevItems => [...prevItems, newItem]);
      toast.success(`Added ${product.name} to wishlist`);
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      if (error instanceof Error && error.message === 'Item already in wishlist') {
        toast.error('Item is already in your wishlist');
      } else {
        toast.error('Failed to add item to wishlist');
      }
    }
  }, [isAuthenticated]);

  const removeItem = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      console.log('Cannot remove from wishlist: user not authenticated');
      toast.error('Please log in to remove items from wishlist');
      return;
    }

    try {
      console.log('Removing item from wishlist:', productId);
      await removeFromWishlistDB(productId);
      console.log('Item removed from wishlist');
      setItems(prevItems => prevItems.filter(item => item.product_id !== productId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  }, [isAuthenticated]);

  const isInWishlist = useCallback(async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }
    try {
      console.log('Checking if item is in wishlist:', productId);
      const result = await checkIsInWishlist(productId);
      console.log('Item in wishlist check result:', result);
      return result;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  }, [isAuthenticated]);

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      addItem,
      removeItem,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 