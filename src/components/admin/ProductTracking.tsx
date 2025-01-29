import React, { useState, useEffect } from 'react';
import { ProductActivity, getProductActivities } from '@/services/productTracking';
import { formatDistanceToNow } from 'date-fns';

interface ProductTrackingProps {
  productId: string;
}

export function ProductTracking({ productId }: ProductTrackingProps) {
  const [activities, setActivities] = useState<ProductActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [productId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getProductActivities(productId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityDescription = (activity: ProductActivity) => {
    switch (activity.activity_type) {
      case 'view':
        return 'Product viewed';
      case 'stock_update':
        return `Stock updated from ${activity.old_value.stock} to ${activity.new_value.stock}`;
      case 'price_update':
        return `Price updated from $${activity.old_value.price} to $${activity.new_value.price}`;
      case 'feature_toggle':
        return `Featured status changed from ${activity.old_value.featured} to ${activity.new_value.featured}`;
      default:
        return 'Unknown activity';
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading activities...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-900">Activity History</h3>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-primary-500">No activities recorded yet</p>
        ) : (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-primary-100"
            >
              <div>
                <p className="text-primary-900">{getActivityDescription(activity)}</p>
                <p className="text-sm text-primary-500">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 