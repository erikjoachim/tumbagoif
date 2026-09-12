import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, X, Package as PackageIcon, Minus, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types';

type EditData = {
  id?: string;
  name: string;
  price: string;
  stock: string;
  category: string;
  sku: string;
};

const emptyForm: EditData = { name: '', price: '', stock: '', category: 'General', sku: '' };

export function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditData | null>(null);
  const [saving, setSaving] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) console.error('Failed to load products:', error);
    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = search.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase().trim()) ||
          (p.sku ?? '').toLowerCase().includes(search.toLowerCase().trim()) ||
          p.category.toLowerCase().includes(search.toLowerCase().trim())
      )
    : products;

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outStock = products.filter((p) => p.stock <= 0).length;

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return;
    setSaving(true);

    const payload = {
      name: editing.name.trim(),
      price: parseFloat(editing.price) || 0,
      stock: parseInt(editing.stock) || 0,
      category: editing.category.trim() || 'General',
      sku: editing.sku.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editing.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) console.error('Update failed:', error);
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) console.error('Insert failed:', error);
    }

    setSaving(false);
    setEditing(null);
    await loadProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Delete failed:', error);
      return;
    }
    await loadProducts();
  };

  const quickAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setAdjustingId(product.id);
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', product.id);
    if (error) console.error('Adjust failed:', error);
    setAdjustingId(null);
    await loadProducts();
  };

  const toggleMenuVisibility = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ show_in_menu: !product.show_in_menu })
      .eq('id', product.id);
    if (error) console.error('Toggle failed:', error);
    await loadProducts();
  };

  const startEdit = (product: Product) => {
    setEditing({
      id: product.id,
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      sku: product.sku ?? '',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-slate-900">{products.length}</p>
            <p className="text-[10px] text-slate-400 font-medium">Products</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-amber-600">{lowStock}</p>
            <p className="text-[10px] text-amber-500 font-medium">Low Stock</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalValue)}</p>
            <p className="text-[10px] text-emerald-500 font-medium">Value</p>
          </div>
        </div>
        {outStock > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{outStock} product{outStock > 1 ? 's' : ''} out of stock</span>
          </div>
        )}
      </div>

      {/* Search + Add */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={() => setEditing({ ...emptyForm })}
          className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center active:scale-90 transition-transform shadow-sm flex-shrink-0"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Product list */}
      <div className="flex-1 p-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageIcon className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              {products.length === 0 ? 'No products yet' : 'No results'}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setEditing({ ...emptyForm })}
                className="mt-3 text-xs font-semibold text-emerald-600"
              >
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-[10px] text-slate-300">|</span>
                    <span className="text-xs text-slate-400">{product.category}</span>
                  </div>
                </div>

                {/* Stock adjuster */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => quickAdjust(product, -1)}
                    disabled={adjustingId === product.id || product.stock <= 0}
                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <span
                    className={`text-sm font-bold w-10 text-center ${
                      product.stock <= 0
                        ? 'text-red-500'
                        : product.stock <= 5
                        ? 'text-amber-600'
                        : 'text-slate-900'
                    }`}
                  >
                    {product.stock}
                  </span>
                  <button
                    onClick={() => quickAdjust(product, 1)}
                    disabled={adjustingId === product.id}
                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => toggleMenuVisibility(product)}
                    title={product.show_in_menu ? 'Dölj från prislista' : 'Visa i prislista'}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium active:scale-90 transition-transform ${
                      product.show_in_menu
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {product.show_in_menu ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {product.show_in_menu ? 'Dölj från prislista' : 'Visa i prislista'}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(product)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setEditing(null)}
          />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
              <h2 className="text-base font-bold text-slate-900">
                {editing.id ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <Field label="Name">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Product name"
                  className="form-input"
                  autoFocus
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (SEK)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    placeholder="0.00"
                    className="form-input"
                  />
                </Field>
                <Field label="Stock Qty">
                  <input
                    type="number"
                    min="0"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                    placeholder="0"
                    className="form-input"
                  />
                </Field>
              </div>

              <Field label="Category">
                <input
                  type="text"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="General"
                  className="form-input"
                />
              </Field>

              <Field label="SKU (optional)">
                <input
                  type="text"
                  value={editing.sku}
                  onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                  placeholder="SKU code"
                  className="form-input"
                />
              </Field>

              <button
                onClick={handleSave}
                disabled={saving || !editing.name.trim()}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
              >
                {saving ? 'Saving...' : editing.id ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
