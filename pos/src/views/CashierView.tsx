import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, X, Package as PackageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import type { Product, CartItem } from '@/types';

export function CashierView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) {
      console.error('Failed to load products:', error);
    }
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState('All');

  const displayProducts = useMemo(() => {
    const base = activeCategory === 'All' ? filtered : filtered.filter((p) => p.category === activeCategory);
    return [...base].sort((a, b) => {
      const aInStock = a.stock > 0 ? 0 : 1;
      const bInStock = b.stock > 0 ? 0 : 1;
      if (aInStock !== bInStock) return aInStock - bInStock;
      return a.name.localeCompare(b.name);
    });
  }, [filtered, activeCategory]);

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, Product[]>();
    for (const product of displayProducts) {
      const category = product.category || 'General';
      const arr = groups.get(category) ?? [];
      arr.push(product);
      groups.set(category, arr);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [displayProducts]);

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.product_id !== productId) return i;
          const product = products.find((p) => p.id === productId);
          const newQty = i.quantity + delta;
          if (product && newQty > product.stock) return i;
          return { ...i, quantity: newQty };
        })
        .filter((i) => i.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const handleConfirmPayment = async () => {
    if (cart.length === 0) return;
    setCompleting(true);
    const items = cart.map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      unit_price: i.unit_price,
      quantity: i.quantity,
    }));

    const { error } = await supabase.rpc('complete_sale', { p_items: items });

    if (error) {
      console.error('Sale failed:', error);
      setCompleting(false);
      return;
    }

    setLastTotal(cartTotal);
    setSuccessOpen(true);
    setCart([]);
    setCartOpen(false);
    setCompleting(false);
    await loadProducts();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all"
          />
        </div>
        {categories.length > 1 && (
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product grid */}
      <div className="flex-1 p-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageIcon className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">No products found</p>
            <p className="text-xs text-slate-300 mt-0.5">Add products in the Inventory tab</p>
          </div>
        ) : (
          <div className="space-y-5">
            {categoryGroups.map(([category, products]) => (
              <div key={category}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {category}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {products.length} {products.length === 1 ? 'product' : 'products'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {products.map((product) => {
              const inCart = cart.find((i) => i.product_id === product.id);
              const outOfStock = product.stock <= 0;
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={outOfStock}
                  className={`relative bg-white rounded-2xl p-3 border text-left transition-all duration-200 active:scale-95 ${
                    outOfStock
                      ? 'border-slate-100 opacity-50'
                      : inCart
                      ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {inCart.quantity}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 pr-5">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        outOfStock
                          ? 'bg-red-50 text-red-500'
                          : product.stock <= 5
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {outOfStock ? 'Out' : `${product.stock} left`}
                    </span>
                  </div>
                </button>
              );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg z-30 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-medium">View Cart</span>
          </div>
          <span className="text-base font-bold">{formatCurrency(cartTotal)}</span>
        </button>
      )}

      {/* Cart sheet */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slideUp">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(item.unit_price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                    <div className="text-right w-16">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={handleConfirmPayment}
                  disabled={completing}
                  className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-emerald-700 disabled:opacity-60 shadow-sm"
                >
                  {completing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success modal */}
      {successOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSuccessOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-8 flex flex-col items-center max-w-xs w-full animate-popIn shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Payment Confirmed</h2>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(lastTotal)}</p>
            <p className="text-xs text-slate-400 mt-1 text-center">
              Sale recorded and inventory updated
            </p>
            <button
              onClick={() => setSuccessOpen(false)}
              className="mt-5 w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
