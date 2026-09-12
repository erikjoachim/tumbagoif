import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Package as PackageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types';

export function MenuView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) console.error('Failed to load menu:', error);
      if (!cancelled) setProducts(data ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const category = product.category || 'General';
      const arr = map.get(category) ?? [];
      arr.push(product);
      map.set(category, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Link
          to="/"
          aria-label="Tillbaka"
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Prislista</h1>
          <p className="text-[10px] text-slate-400 leading-tight">Menu &amp; prices</p>
        </div>
      </header>

      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageIcon className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">Inga produkter ännu</p>
          </div>
        ) : (
          groups.map(([category, items]) => (
            <section key={category} className="mb-6">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                {category}
              </h2>
              <ul className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {items.map((product) => (
                  <li
                    key={product.id}
                    className={`px-4 py-3 flex items-center justify-between gap-3 ${
                      product.stock <= 0 ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {product.name}
                      </p>
                      {product.sku && <p className="text-[10px] text-slate-400">{product.sku}</p>}
                      {product.stock <= 0 && (
                        <p className="text-[10px] font-medium text-red-500">Slut i lager</p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-emerald-600 flex-shrink-0">
                      {formatCurrency(product.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}