-- Create wishlists table
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Add RLS policies
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policy to view own wishlist items
CREATE POLICY "Users can view own wishlist items" ON wishlists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to insert own wishlist items
CREATE POLICY "Users can add items to own wishlist" ON wishlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to delete own wishlist items
CREATE POLICY "Users can remove items from own wishlist" ON wishlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 