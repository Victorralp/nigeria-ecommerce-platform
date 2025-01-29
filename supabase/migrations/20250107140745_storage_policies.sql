-- Create products bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the products bucket
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'products'
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'products'
    AND owner = auth.uid()
)
WITH CHECK (
    bucket_id = 'products'
    AND owner = auth.uid()
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'products'
    AND owner = auth.uid()
); 