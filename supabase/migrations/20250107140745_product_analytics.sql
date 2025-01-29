-- Create product views table
CREATE TABLE product_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id)
);

-- Create stock history table
CREATE TABLE stock_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order items table for tracking sales
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Product views policies
CREATE POLICY "Allow read access to product views" ON product_views
  FOR SELECT USING (true);

CREATE POLICY "Allow insert/update to product views for authenticated users" ON product_views
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock history policies
CREATE POLICY "Allow read access to stock history" ON stock_history
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to stock history for authenticated users" ON stock_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "Allow read access to order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Allow insert to order items for authenticated users" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger for product_views
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON product_views
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 