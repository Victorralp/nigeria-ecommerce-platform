import { supabase } from './supabase';
import { uploadProductImage, deleteProductImage, getOptimizedImageUrl } from './storage';

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image?: string;
  stock: number;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductWithOptimizedImages extends Product {
  optimizedImages: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

export async function getProducts(): Promise<ProductWithOptimizedImages[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(product => ({
      ...product,
      optimizedImages: product.image ? {
        thumbnail: getOptimizedImageUrl(product.image, 'thumbnail'),
        medium: getOptimizedImageUrl(product.image, 'medium'),
        large: getOptimizedImageUrl(product.image, 'large'),
        original: getOptimizedImageUrl(product.image, 'original')
      } : {
        thumbnail: '',
        medium: '',
        large: '',
        original: ''
      }
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching products');
  }
}

export async function getProduct(id: string): Promise<ProductWithOptimizedImages> {
  if (!id) {
    throw new Error('Product ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return {
      ...data,
      optimizedImages: data.image ? {
        thumbnail: getOptimizedImageUrl(data.image, 'thumbnail'),
        medium: getOptimizedImageUrl(data.image, 'medium'),
        large: getOptimizedImageUrl(data.image, 'large'),
        original: getOptimizedImageUrl(data.image, 'original')
      } : {
        thumbnail: '',
        medium: '',
        large: '',
        original: ''
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching the product');
  }
}

export async function createProduct(product: Omit<Product, 'id'>, image?: File): Promise<Product> {
  // Validate required fields
  if (!product.name?.trim()) {
    throw new Error('Product name is required');
  }
  if (typeof product.price !== 'number' || product.price <= 0) {
    throw new Error('Product price must be a positive number');
  }
  if (typeof product.stock !== 'number' || product.stock < 0) {
    throw new Error('Product stock cannot be negative');
  }

  try {
    let imagePath = '';
    if (image) {
      imagePath = await uploadProductImage(image);
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        ...product,
        image: imagePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    if (!data) {
      throw new Error('Product was created but no data was returned');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating the product');
  }
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  newImage?: File
): Promise<Product> {
  // Validate inputs
  if (!id) {
    throw new Error('Product ID is required');
  }
  if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
    throw new Error('Product price must be a positive number');
  }
  if (updates.stock !== undefined && (typeof updates.stock !== 'number' || updates.stock < 0)) {
    throw new Error('Product stock cannot be negative');
  }

  try {
    let imagePath = updates.image;

    // If a new image is provided, upload it and delete the old one
    if (newImage) {
      // Get the current product to find the old image
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('image')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current product: ${fetchError.message}`);
      }

      // Delete the old image if it exists
      if (currentProduct?.image) {
        await deleteProductImage(currentProduct.image);
      }

      // Upload the new image
      imagePath = await uploadProductImage(newImage);
    }

    const { data, error } = await supabase
      .from('products')
      .update({ 
        ...updates, 
        image: imagePath,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    if (!data) {
      throw new Error('Product was updated but no data was returned');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while updating the product');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!id) {
    throw new Error('Product ID is required');
  }

  try {
    // Get the product's image before deleting
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`);
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Failed to delete product: ${deleteError.message}`);
    }

    // If the product had an image, delete it from storage
    if (product?.image) {
      await deleteProductImage(product.image);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while deleting the product');
  }
} 