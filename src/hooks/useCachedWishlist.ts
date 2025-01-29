import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlistItems, addToWishlist, removeFromWishlist, isInWishlist } from '@/services/wishlist';
import { Product } from '@/services/products';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export function useCachedWishlist() {
  const queryClient = useQueryClient();
  const { isAuthenticated, session } = useAuth();

  // Fetch wishlist items with caching
  const {
    data: wishlistItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlistItems,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Check if a product is in wishlist (cached)
  const checkIsInWishlist = async (productId: string) => {
    if (!isAuthenticated) return false;
    
    // Check cache first
    const cachedItems = queryClient.getQueryData<Product[]>(['wishlist']);
    if (cachedItems) {
      return cachedItems.some(item => item.id === productId);
    }
    
    // Fallback to API call
    return isInWishlist(productId);
  };

  // Add to wishlist mutation with optimistic update
  const addItemMutation = useMutation({
    mutationFn: addToWishlist,
    onMutate: async (product) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<Product[]>(['wishlist']) || [];

      // Optimistically update the cache
      queryClient.setQueryData<Product[]>(['wishlist'], old => {
        if (!old) return [product];
        if (old.some(item => item.id === product.id)) return old;
        return [...old, product];
      });

      return { previousItems };
    },
    onError: (err, product, context) => {
      // Revert the optimistic update on error
      queryClient.setQueryData(['wishlist'], context?.previousItems);
      toast.error('Failed to add item to wishlist');
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  // Remove from wishlist mutation with optimistic update
  const removeItemMutation = useMutation({
    mutationFn: removeFromWishlist,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousItems = queryClient.getQueryData<Product[]>(['wishlist']) || [];

      queryClient.setQueryData<Product[]>(['wishlist'], old => {
        if (!old) return [];
        return old.filter(item => item.id !== productId);
      });

      return { previousItems };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(['wishlist'], context?.previousItems);
      toast.error('Failed to remove item from wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  return {
    wishlistItems,
    isLoading,
    error,
    checkIsInWishlist,
    addItem: addItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    isAddingItem: addItemMutation.isLoading,
    isRemovingItem: removeItemMutation.isLoading,
  };
} 