import { supabase } from './supabase';

// Rate limiting configuration
const VIEW_RATE_LIMIT = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxViews: 10 // Maximum views per window
};

interface ProductView {
  product_id: string;
  view_count: number;
  last_viewed: string;
}

interface ProductAnalytics {
  views: number;
  sales: number;
  revenue: number;
  stock_history: {
    date: string;
    stock: number;
  }[];
}

// In-memory rate limiting store
const viewTracker = new Map<string, { count: number; timestamp: number }>();

// Helper function to check rate limit
function checkRateLimit(productId: string): boolean {
  const now = Date.now();
  const viewData = viewTracker.get(productId);

  if (!viewData) {
    viewTracker.set(productId, { count: 1, timestamp: now });
    return true;
  }

  if (now - viewData.timestamp > VIEW_RATE_LIMIT.windowMs) {
    // Reset if window has passed
    viewTracker.set(productId, { count: 1, timestamp: now });
    return true;
  }

  if (viewData.count >= VIEW_RATE_LIMIT.maxViews) {
    return false;
  }

  viewData.count++;
  return true;
}

// Clean up old rate limiting data periodically
setInterval(() => {
  const now = Date.now();
  for (const [productId, data] of viewTracker.entries()) {
    if (now - data.timestamp > VIEW_RATE_LIMIT.windowMs) {
      viewTracker.delete(productId);
    }
  }
}, VIEW_RATE_LIMIT.windowMs);

export async function trackProductView(productId: string) {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  // Check rate limit
  if (!checkRateLimit(productId)) {
    return; // Silently ignore if rate limited
  }

  try {
    const { data, error } = await supabase
      .from('product_views')
      .select('*')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch product views: ${error.message}`);
    }

    const timestamp = new Date().toISOString();

    if (data) {
      // Update existing view count
      const { error: updateError } = await supabase
        .from('product_views')
        .update({
          view_count: data.view_count + 1,
          last_viewed: timestamp
        })
        .eq('product_id', productId);

      if (updateError) {
        throw new Error(`Failed to update view count: ${updateError.message}`);
      }
    } else {
      // Create new view record
      const { error: insertError } = await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          view_count: 1,
          last_viewed: timestamp
        });

      if (insertError) {
        throw new Error(`Failed to create view record: ${insertError.message}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while tracking product view');
  }
}

export async function trackStockUpdate(productId: string, newStock: number) {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  if (typeof newStock !== 'number' || newStock < 0) {
    throw new Error('Invalid stock value');
  }

  try {
    const timestamp = new Date().toISOString();

    const { error } = await supabase
      .from('stock_history')
      .insert({
        product_id: productId,
        stock: newStock,
        created_at: timestamp
      });

    if (error) {
      throw new Error(`Failed to track stock update: ${error.message}`);
    }

    // Clean up old stock history (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from('stock_history')
      .delete()
      .eq('product_id', productId)
      .lt('created_at', thirtyDaysAgo.toISOString());

  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while tracking stock update');
  }
}

export async function getProductAnalytics(productId: string, days: number = 30): Promise<ProductAnalytics> {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  if (days <= 0 || days > 365) {
    throw new Error('Days must be between 1 and 365');
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get views
    const { data: viewData, error: viewError } = await supabase
      .from('product_views')
      .select('view_count')
      .eq('product_id', productId)
      .single();

    if (viewError && viewError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch view data: ${viewError.message}`);
    }

    // Get sales and revenue within date range
    const { data: salesData, error: salesError } = await supabase
      .from('order_items')
      .select('quantity, price, created_at')
      .eq('product_id', productId)
      .gte('created_at', startDateStr);

    if (salesError) {
      throw new Error(`Failed to fetch sales data: ${salesError.message}`);
    }

    // Get stock history within date range
    const { data: stockData, error: stockError } = await supabase
      .from('stock_history')
      .select('created_at, stock')
      .eq('product_id', productId)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: true });

    if (stockError) {
      throw new Error(`Failed to fetch stock history: ${stockError.message}`);
    }

    const totalSales = salesData?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    const totalRevenue = salesData?.reduce((sum, item) => sum + (item.quantity * item.price), 0) ?? 0;

    return {
      views: viewData?.view_count ?? 0,
      sales: totalSales,
      revenue: totalRevenue,
      stock_history: stockData?.map(item => ({
        date: item.created_at,
        stock: item.stock
      })) ?? []
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching product analytics');
  }
} 