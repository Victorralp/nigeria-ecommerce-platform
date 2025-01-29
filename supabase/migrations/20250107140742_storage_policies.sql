-- Create storage policies for the product-images bucket
DO $$
BEGIN
    -- Enable RLS for the storage.objects table
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow authenticated users to upload files
    CREATE POLICY "Allow authenticated users to upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

    -- Create policy to allow authenticated users to update their files
    CREATE POLICY "Allow authenticated users to update files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

    -- Create policy to allow authenticated users to delete their files
    CREATE POLICY "Allow authenticated users to delete files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');

    -- Create policy to allow public to read files
    CREATE POLICY "Allow public to read files"
    ON storage.objects FOR SELECT
    TO public
    USING (true);

    -- Enable RLS for storage.buckets
    ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow authenticated users to create buckets
    CREATE POLICY "Allow authenticated users to create buckets"
    ON storage.buckets FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

    -- Create policy to allow authenticated users to read buckets
    CREATE POLICY "Allow authenticated users to read buckets"
    ON storage.buckets FOR SELECT
    TO authenticated
    USING (auth.role() = 'authenticated');

    -- Create policy to allow authenticated users to update buckets
    CREATE POLICY "Allow authenticated users to update buckets"
    ON storage.buckets FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
END
$$; 