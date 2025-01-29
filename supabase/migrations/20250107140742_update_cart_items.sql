-- Drop existing foreign key constraint
ALTER TABLE cart_items DROP CONSTRAINT cart_items_product_id_fkey;

-- Change product_id column type to bigint
ALTER TABLE cart_items ALTER COLUMN product_id TYPE bigint USING product_id::text::bigint;

-- Add new foreign key constraint
ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
