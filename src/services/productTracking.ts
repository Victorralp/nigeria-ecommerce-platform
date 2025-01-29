import { supabase } from './supabase';

export interface ProductActivity {
  id: string;
  product_id: string;
  activity_type: 'view' | 'stock_update' | 'price_update' | 'feature_toggle';
  old_value: any;
  new_value: any;
  created_at: string;
  created_by: string;
}

export async function getProductActivities(productId: string): Promise<ProductActivity[]> {
  const { data, error } = await supabase
    .from('product_activities')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching product activities:', error);
    throw error;
  }

  return data || [];
}

export async function trackProductView(productId: string): Promise<void> {
  const { error } = await supabase
    .from('product_activities')
    .insert([{
      product_id: productId,
      activity_type: 'view',
      new_value: { timestamp: new Date().toISOString() }
    }]);

  if (error) {
    console.error('Error tracking product view:', error);
    throw error;
  }
} 