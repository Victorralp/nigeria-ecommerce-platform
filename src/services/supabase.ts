import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

// Custom storage implementation that falls back to memory storage
class CustomStorage implements Storage {
  private memoryStorage: Map<string, string>;
  private useMemory: boolean;

  constructor() {
    this.memoryStorage = new Map();
    this.useMemory = false;

    try {
      // Test if localStorage is available
      const testKey = '__test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      this.useMemory = false;
    } catch (e) {
      console.warn('localStorage not available, falling back to memory storage');
      this.useMemory = true;
    }
  }

  getItem(key: string): string | null {
    if (this.useMemory) {
      return this.memoryStorage.get(key) || null;
    }
    try {
      return window.localStorage.getItem(key);
    } catch {
      return this.memoryStorage.get(key) || null;
    }
  }

  setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStorage.set(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch {
      this.memoryStorage.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.useMemory) {
      this.memoryStorage.delete(key);
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      this.memoryStorage.delete(key);
    }
  }

  clear(): void {
    if (this.useMemory) {
      this.memoryStorage.clear();
      return;
    }
    try {
      window.localStorage.clear();
    } catch {
      this.memoryStorage.clear();
    }
  }

  get length(): number {
    if (this.useMemory) {
      return this.memoryStorage.size;
    }
    try {
      return window.localStorage.length;
    } catch {
      return this.memoryStorage.size;
    }
  }

  key(index: number): string | null {
    if (this.useMemory) {
      return Array.from(this.memoryStorage.keys())[index] || null;
    }
    try {
      return window.localStorage.key(index);
    } catch {
      return Array.from(this.memoryStorage.keys())[index] || null;
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'auth-storage',
    storage: new CustomStorage(),
    detectSessionInUrl: false,
    autoRefreshToken: true,
    flowType: 'pkce'
  }
});

// Storage bucket configuration
export const STORAGE_BUCKET = 'product';

// Helper function to test bucket connection
export async function testBucketConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // First, list all buckets to check access
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return { 
        success: false, 
        message: `Failed to list buckets: ${bucketsError.message}` 
      };
    }

    console.log('Available buckets:', buckets.map(b => b.name));

    // Check if our bucket exists
    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
    if (!bucketExists) {
      return { 
        success: false, 
        message: `Bucket '${STORAGE_BUCKET}' not found. Available buckets: ${buckets.map(b => b.name).join(', ')}` 
      };
    }

    // Try to list contents of the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list();

    if (listError) {
      console.error('Error listing bucket contents:', listError);
      return { 
        success: false, 
        message: `Failed to list bucket contents: ${listError.message}` 
      };
    }

    // Try to get the bucket's public URL
    const { data: urlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl('test');

    if (!urlData.publicUrl) {
      console.error('Error getting public URL: No URL returned');
      return { 
        success: false, 
        message: 'Failed to get public URL: No URL returned' 
      };
    }

    return {
      success: true,
      message: `Successfully connected to bucket '${STORAGE_BUCKET}'. Found ${files.length} files. Public URL access is working.`
    };

  } catch (error) {
    console.error('Unexpected error testing bucket connection:', error);
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Helper function to get a public URL for a file
export function getPublicUrl(filePath: string): string {
  try {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    if (!data.publicUrl) {
      console.error('Failed to get public URL for file:', filePath);
      return '';
    }
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return '';
  }
}

// Helper function to upload a file to storage
export async function uploadFile(file: File, folder: string = 'product-images'): Promise<string> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('Not authenticated');
    }

    // Test bucket connection first
    const { success, message } = await testBucketConnection();
    if (!success) {
      throw new Error(`Storage not available: ${message}`);
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) {
      throw new Error('Invalid file extension. Only jpg, jpeg, png, and webp files are allowed.');
    }

    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    return filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
} 