/*
# Point of Sale Schema

1. New Tables
- `products`: Stores product catalog with name, price, stock quantity, optional category and SKU.
- `sales`: Records completed transactions with total amount, item count, and timestamp.
- `sale_items`: Line items for each sale — snapshots product name and price at time of sale for historical accuracy.

2. Functions
- `complete_sale(p_items jsonb)`: Atomically creates a sale record, inserts all sale items, and decrements product stock. Returns the new sale ID. SECURITY DEFINER so it runs with elevated privileges to update stock in one transaction.

3. Security
- RLS enabled on all tables.
- This is a single-tenant app (no sign-in), so policies allow `anon, authenticated` full CRUD — data is intentionally shared.
- The `complete_sale` function is SECURITY DEFINER and granted to `anon, authenticated` so the frontend can call it via RPC.

4. Important Notes
- Product name and unit_price are snapshotted into sale_items so historical receipts stay accurate even if a product's price or name changes later.
- Stock is decremented inside the same transaction as the sale insert, so inventory is always consistent.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  category text DEFAULT 'General',
  sku text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total numeric(10,2) NOT NULL DEFAULT 0,
  item_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Products policies (single-tenant: anon + authenticated full access)
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- Sales policies
DROP POLICY IF EXISTS "anon_select_sales" ON sales;
CREATE POLICY "anon_select_sales" ON sales FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sales" ON sales;
CREATE POLICY "anon_insert_sales" ON sales FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sales" ON sales;
CREATE POLICY "anon_delete_sales" ON sales FOR DELETE
  TO anon, authenticated USING (true);

-- Sale items policies
DROP POLICY IF EXISTS "anon_select_sale_items" ON sale_items;
CREATE POLICY "anon_select_sale_items" ON sale_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sale_items" ON sale_items;
CREATE POLICY "anon_insert_sale_items" ON sale_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Atomic sale completion function
CREATE OR REPLACE FUNCTION complete_sale(p_items jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sale_id uuid;
  v_item jsonb;
  v_total numeric(10,2) := 0;
  v_count integer := 0;
  v_qty integer;
  v_price numeric(10,2);
  v_pid uuid;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot complete a sale with no items';
  END IF;

  INSERT INTO sales (total, item_count) VALUES (0, 0) RETURNING id INTO v_sale_id;

  FOREACH v_item IN ARRAY p_items LOOP
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::integer;
    v_price := (v_item->>'unit_price')::numeric;

    INSERT INTO sale_items (sale_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (
      v_sale_id,
      v_pid,
      v_item->>'product_name',
      v_price,
      v_qty,
      v_price * v_qty
    );

    UPDATE products
      SET stock = stock - v_qty, updated_at = now()
      WHERE id = v_pid;

    v_total := v_total + (v_price * v_qty);
    v_count := v_count + v_qty;
  END LOOP;

  UPDATE sales SET total = v_total, item_count = v_count WHERE id = v_sale_id;

  RETURN v_sale_id;
END;
$$;

GRANT EXECUTE ON FUNCTION complete_sale(jsonb) TO anon, authenticated;