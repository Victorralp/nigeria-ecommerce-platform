import { supabase } from './supabase';
import { Product } from '@/types/Product';
import { CartItem } from '@/types/Cart';

export async function getCartItems(): Promise<CartItem[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }

  return cartItems || [];
}

export async function addToCart(productId: string | number, quantity: number = 1): Promise<CartItem> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  // Convert productId to string for consistent comparison
  const productIdStr = String(productId);
  
  // Check if product exists first
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productIdStr)
    .single();

  if (productError || !product) {
    throw new Error('Product not found');
  }

  // Check for existing item
  const { data: existingItem, error: fetchError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('product_id', productIdStr)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
    throw fetchError;
  }

  if (existingItem) {
    // Update quantity if item exists
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } else {
    // Insert new item if it doesn't exist
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ 
        product_id: productIdStr, 
        quantity,
        user_id: session.session.user.id 
      }])
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', session.session.user.id)
    .select(`
      *,
      product:products(*)
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', session.session.user.id);

  if (error) {
    throw error;
  }
}

export async function clearCart(): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', session.session.user.id);

  if (error) {
    throw error;
  }
} 