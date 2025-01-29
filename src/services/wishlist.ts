import { supabase } from './supabase';
import { Product } from '@/types/Product';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('*, product:products(*)')
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlist items:', error);
    throw error;
  }

  return data || [];
}

export async function addToWishlist(productId: string): Promise<WishlistItem> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  // Check if product exists first
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    throw new Error('Product not found');
  }

  // Check if item is already in wishlist
  const { data: existingItem, error: existingError } = await supabase
    .from('wishlists')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', session.session.user.id)
    .single();

  if (existingError && existingError.code !== 'PGRST116') { // PGRST116 means no rows returned
    throw existingError;
  }

  if (existingItem) {
    throw new Error('Item already in wishlist');
  }

  // Add item to wishlist
  const { data, error } = await supabase
    .from('wishlists')
    .insert([{
      product_id: productId,
      user_id: session.session.user.id
    }])
    .select('*, product:products(*)')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('product_id', productId)
    .eq('user_id', session.session.user.id);

  if (error) {
    throw error;
  }
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    return false;
  }

  const { count, error } = await supabase
    .from('wishlists')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)
    .eq('user_id', session.session.user.id);

  if (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }

  return count ? count > 0 : false;
} 