import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getProduct } from '@/services/products';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductAnalytics } from '@/components/admin/ProductAnalytics';
import { Loader2 } from 'lucide-react';

export function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-8 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <ProductForm initialData={product} />
        </div>
        
        <div>
          <ProductAnalytics productId={id!} />
        </div>
      </div>
    </motion.div>
  );
} 