import { supabase } from './supabase';

// Constants for storage configuration
const STORAGE_BUCKET = 'products'; // Correct bucket name
const STORAGE_FOLDER = 'product-images'; // Correct subfolder name

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

interface ImageSize {
  width: number;
  height?: number;
  quality?: number;
  maxFileSize?: number; // Optional max file size specific to this size
}

const IMAGE_SIZES: Record<string, ImageSize> = {
  thumbnail: { width: 100, height: 100, quality: 80, maxFileSize: 1024 * 100 }, // 100KB
  medium: { width: 300, quality: 85, maxFileSize: 1024 * 500 }, // 500KB
  large: { width: 800, quality: 90, maxFileSize: 1024 * 1024 }, // 1MB
  original: { width: 1200, quality: 95, maxFileSize: MAX_FILE_SIZE } // 5MB
};

// Helper function to validate image dimensions
async function validateImageDimensions(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url); // Clean up
      if (img.width > IMAGE_SIZES.original.width * 2) {
        reject(new Error(`Image width must not exceed ${IMAGE_SIZES.original.width * 2}px`));
      }
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url); // Clean up
      reject(new Error('Failed to load image for validation'));
    };

    img.src = url;
  });
}

// Helper function to check if storage is configured
async function checkStorageAccess(): Promise<void> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Storage access error:', error);
      throw new Error(`Storage access error: ${error.message}`);
    }

    if (!buckets || buckets.length === 0) {
      console.error('No storage buckets found.');
      throw new Error('No storage buckets found. Please create a bucket named "products" in your Supabase dashboard.');
    }

    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
    if (!bucketExists) {
      console.error(`Storage bucket '${STORAGE_BUCKET}' not found.`);
      throw new Error(`Storage bucket '${STORAGE_BUCKET}' not found. Available buckets: ${buckets.map(b => b.name).join(', ')}`);
    }
  } catch (error) {
    console.error('Error checking storage access:', error);
    throw error;
  }
}

export function getOptimizedImageUrl(
  imageUrl: string,
  size: keyof typeof IMAGE_SIZES = 'original',
  format: 'webp' | 'jpeg' = 'webp'
): string {
  if (!imageUrl) return '';

  const { width, height, quality } = IMAGE_SIZES[size];
  const transformations: string[] = [];

  // Add width transformation
  transformations.push(`width=${width}`);

  // Add height transformation if specified
  if (height) {
    transformations.push(`height=${height}`);
  }

  // Add quality transformation
  if (quality) {
    transformations.push(`quality=${quality}`);
  }

  // Add format transformation
  transformations.push(`format=${format}`);

  try {
    // Get the public URL from Supabase
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(imageUrl);
    if (!data.publicUrl) {
      console.error('Failed to get public URL for image:', imageUrl);
      return '';
    }

    // Construct the transformed URL
    const [baseUrl, queryString] = data.publicUrl.split('?');
    const transformationString = transformations.join('&');

    return `${baseUrl}?${transformationString}${queryString ? `&${queryString}` : ''}`;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return '';
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  // Input validation
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    throw new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
  }

  try {
    // Check storage access
    await checkStorageAccess();

    // Validate file name and extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      throw new Error(`Invalid file extension. Allowed extensions are: ${allowedExtensions.join(', ')}`);
    }

    // Validate image dimensions
    await validateImageDimensions(file);

    // Generate a unique filename with UUID
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${STORAGE_FOLDER}/${fileName}`; // Use subfolder for file path

    // Upload the file
    const { data, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    if (!data?.path) {
      throw new Error('Upload succeeded but no file path was returned');
    }

    return data.path;
  } catch (error) {
    // Clean up any temporary resources
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while uploading the image');
  }
}

export async function deleteProductImage(imagePath: string): Promise<void> {
  if (!imagePath) {
    return;
  }

  try {
    // Correct the image path validation logic
    if (!imagePath.startsWith(STORAGE_BUCKET)) {
      throw new Error('Invalid image path format');
    }

    // If the path includes the bucket name, remove it
    const path = imagePath.replace(`${STORAGE_BUCKET}/`, '');
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while deleting the image');
  }
}

export async function testStorageConnection() {
  try {
    // List all buckets to verify access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return { success: false, message: `Failed to list buckets: ${bucketsError.message}` };
    }

    console.log('Available buckets:', buckets?.map(b => b.name));

    // Check if our bucket exists
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    if (!bucketExists) {
      const availableBuckets = buckets?.map(b => b.name).join(', ') || 'none';
      return { 
        success: false, 
        message: `Bucket '${STORAGE_BUCKET}' not found. Available buckets: ${availableBuckets}\n\n` +
          'To fix this:\n' +
          '1. Go to your Supabase Dashboard\n' +
          '2. Navigate to Storage\n' +
          '3. Click "New Bucket"\n' +
          '4. Name it "product"\n' +
          '5. Enable "Public bucket" option\n' +
          '6. Click "Create bucket"'
      };
    }

    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(STORAGE_FOLDER); // List from subfolder

    if (filesError) {
      console.error('Error listing files:', filesError);
      return { success: false, message: `Failed to list files: ${filesError.message}` };
    }

    return { 
      success: true, 
      message: `Successfully connected to bucket '${STORAGE_BUCKET}'. Found ${files?.length || 0} files in '${STORAGE_FOLDER}' folder.` 
    };
  } catch (error) {
    console.error('Unexpected error testing storage:', error);
    return { success: false, message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` };
  }
} 