/*
# Fix complete_sale jsonb iteration

The initial migration used `FOREACH v_item IN ARRAY p_items` on a `jsonb`
parameter. PL/pgSQL `FOREACH ... IN ARRAY` only accepts real array types, so
the RPC failed with "FOREACH expression must yield an array, not type jsonb".

Replaced with `FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)`.
Otherwise behavior is identical (atomic sale + sale_items insert, stock
decrement, totals back-filled). Applied via `supabase db push` WITHOUT running
any seed data.
*/

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

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
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