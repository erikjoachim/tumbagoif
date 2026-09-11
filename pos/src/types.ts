export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  total: number;
  item_count: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[];
}
