import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '@/services/supabase';
import { ProductForm } from '@/components/admin/ProductForm';
import { uploadProductImage } from '@/services/storage';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  featured: boolean;
  image?: File;
}

export function CreateProductPage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (formData.image) {
        imageUrl = await uploadProductImage(formData.image);
      }

      // Create product in database
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            stock: formData.stock,
            category: formData.category,
            featured: formData.featured,
            image: imageUrl
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new product to your catalog
        </p>
      </div>
      
      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 