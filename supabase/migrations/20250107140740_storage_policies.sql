-- Create policies for the product storage bucket
BEGIN;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product');

-- Policy for admin users to upload files
CREATE POLICY "Only admins can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product' 
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

-- Policy for admin users to delete files
CREATE POLICY "Only admins can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product'
  AND EXISTS (
    SELECT 1 FROM admins
    WHERE admins.id = auth.uid()
  )
);

COMMIT; 