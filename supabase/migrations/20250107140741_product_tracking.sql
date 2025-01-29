-- Create product_activities table for tracking
CREATE TABLE product_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('view', 'stock_update', 'price_update', 'feature_toggle')),
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE product_activities ENABLE ROW LEVEL SECURITY;

-- Policies for product_activities
CREATE POLICY "Public can view activities"
  ON product_activities FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert activities"
  ON product_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );

-- Create function to track product updates
CREATE OR REPLACE FUNCTION track_product_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Track stock updates
    IF NEW.stock != OLD.stock THEN
      INSERT INTO product_activities (
        product_id,
        activity_type,
        old_value,
        new_value,
        created_by
      ) VALUES (
        NEW.id,
        'stock_update',
        jsonb_build_object('stock', OLD.stock),
        jsonb_build_object('stock', NEW.stock),
        auth.uid()
      );
    END IF;

    -- Track price updates
    IF NEW.price != OLD.price THEN
      INSERT INTO product_activities (
        product_id,
        activity_type,
        old_value,
        new_value,
        created_by
      ) VALUES (
        NEW.id,
        'price_update',
        jsonb_build_object('price', OLD.price),
        jsonb_build_object('price', NEW.price),
        auth.uid()
      );
    END IF;

    -- Track feature toggle
    IF NEW.featured != OLD.featured THEN
      INSERT INTO product_activities (
        product_id,
        activity_type,
        old_value,
        new_value,
        created_by
      ) VALUES (
        NEW.id,
        'feature_toggle',
        jsonb_build_object('featured', OLD.featured),
        jsonb_build_object('featured', NEW.featured),
        auth.uid()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 