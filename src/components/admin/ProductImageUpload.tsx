import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadProductImage, deleteProductImage, getPublicUrl } from '@/services/storage';
import { toast } from 'react-hot-toast';

interface ProductImageUploadProps {
  currentImageUrl?: string;
  currentImagePath?: string;
  onImageUpload: (imageUrl: string, imagePath: string) => void;
  onImageRemove: () => void;
}

export function ProductImageUpload({
  currentImageUrl,
  currentImagePath,
  onImageUpload,
  onImageRemove
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const { url, path } = await uploadProductImage(file);
      
      // If there was a previous image, delete it
      if (currentImagePath) {
        try {
          await deleteProductImage(currentImagePath);
        } catch (error) {
          console.error('Failed to delete old image:', error);
          // Continue anyway as the new image was uploaded successfully
        }
      }

      onImageUpload(url, path);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      // Revert preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl); // Clean up preview URL
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImagePath) return;

    try {
      await deleteProductImage(currentImagePath);
      setPreviewUrl(null);
      onImageRemove();
      toast.success('Image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        {previewUrl ? (
          // Image Preview with Remove Button
          <div className="relative aspect-square w-full max-w-md border rounded-lg overflow-hidden group">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            {!isUploading && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full 
                         opacity-0 group-hover:opacity-100 transition-opacity
                         hover:bg-red-600"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          // Upload Button
          <label
            className={`
              flex flex-col items-center justify-center w-full max-w-md aspect-square
              border-2 border-dashed rounded-lg
              ${isUploading ? 'bg-gray-100 cursor-wait' : 'hover:bg-gray-50 cursor-pointer'}
              transition-colors
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or WebP (Max. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Recommended: Square image, at least 1000x1000 pixels
      </p>
    </div>
  );
} 