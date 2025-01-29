import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { testStorageConnection, uploadProductImage } from '@/services/storage';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface UploadState {
  progress: number;
  error: string | null;
  retries: number;
}

export function StorageTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    progress: 0,
    error: null,
    retries: 0
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const resetUploadState = () => {
    setUploadState({
      progress: 0,
      error: null,
      retries: 0
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testStorageConnection();
      toast.success(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to test storage connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG and WebP images are allowed.';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return `File size exceeds ${maxSize / (1024 * 1024)}MB limit.`;
    }

    return null;
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      event.target.value = '';
      return;
    }

    resetUploadState();
    let currentRetry = 0;

    const attemptUpload = async (): Promise<string> => {
      try {
        setUploadState(prev => ({ ...prev, progress: 25 }));
        const filePath = await uploadProductImage(file);
        setUploadState(prev => ({ ...prev, progress: 100 }));
        return filePath;
      } catch (error) {
        if (currentRetry < MAX_RETRIES) {
          currentRetry++;
          setUploadState(prev => ({
            ...prev,
            retries: currentRetry,
            error: `Upload failed, retrying (${currentRetry}/${MAX_RETRIES})...`
          }));
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return attemptUpload();
        }
        throw error;
      }
    };

    try {
      const filePath = await attemptUpload();
      setUploadedImageUrl(filePath);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to upload image',
        progress: 0
      }));
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      setUploadedImageUrl(null);
    } finally {
      event.target.value = '';
    }
  }, []);

  const isUploading = uploadState.progress > 0 && uploadState.progress < 100;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Storage Test</h2>

      {/* Test Connection Button */}
      <div className="mb-6">
        <button
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          className={`
            px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors
            ${isTestingConnection 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-700'
            }
          `}
        >
          {isTestingConnection ? 'Testing Connection...' : 'Test Storage Connection'}
        </button>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label
            htmlFor="file-upload"
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed
              ${isUploading 
                ? 'bg-gray-100 cursor-wait' 
                : 'hover:bg-gray-50 cursor-pointer'
              }
              transition-colors
            `}
          >
            <Upload className="w-5 h-5" />
            <span>
              {isUploading 
                ? `Uploading... ${uploadState.progress}%` 
                : 'Upload Image'
              }
            </span>
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {/* Progress Bar */}
          {isUploading && (
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {uploadState.error && (
          <p className="text-sm text-red-500 mt-2">{uploadState.error}</p>
        )}

        {/* Preview Section */}
        {uploadedImageUrl && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Uploaded Image:</h3>
              <button
                onClick={() => setUploadedImageUrl(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full max-w-md border rounded-lg overflow-hidden">
              <img
                src={uploadedImageUrl}
                alt="Uploaded preview"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 break-all">{uploadedImageUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}