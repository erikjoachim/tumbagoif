import { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, ChevronDown, ChevronUp, Calendar, TrendingUp, Package as PackageIcon, ListFilter, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDateTime, formatTime, formatDateLabel } from '@/lib/format';
import type { SaleWithItems, SaleItem } from '@/types';

type ViewMode = 'receipts' | 'items';

export function HistoryView() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('receipts');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) console.error('Failed to load sales:', error);
    setSales(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const historyDeleteEnabled = import.meta.env.VITE_ENABLE_HISTORY_DELETE === 'true';

  const handleClearHistory = async () => {
    if (!window.confirm('Delete ALL sales history? This cannot be undone.')) return;
    setLoading(true);
    const { error } = await supabase.from('sales').delete().gte('created_at', '1970-01-01');
    if (error) console.error('Failed to clear history:', error);
    setSelectedDate(null);
    await loadSales();
  };

  // Build list of dates that have sales
  const availableDates = useMemo(() => {
    const set = new Set(sales.map((s) => new Date(s.created_at).toDateString()));
    return Array.from(set).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [sales]);

  // Filter sales by selected date (or all if none selected)
  const visibleSales = useMemo(() => {
    if (!selectedDate) return sales;
    return sales.filter((s) => new Date(s.created_at).toDateString() === selectedDate);
  }, [sales, selectedDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter((s) => new Date(s.created_at) >= today);
  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
  const todayItems = todaySales.reduce((sum, s) => sum + s.item_count, 0);

  const visibleTotal = visibleSales.reduce((sum, s) => sum + Number(s.total), 0);
  const visibleItems = visibleSales.reduce((sum, s) => sum + s.item_count, 0);
  const allTimeTotal = sales.reduce((sum, s) => sum + Number(s.total), 0);

  // Group visible sales by date for receipts view
  const dateGroups = useMemo(() => {
    const grouped = visibleSales.reduce<Record<string, SaleWithItems[]>>((acc, sale) => {
      const date = new Date(sale.created_at).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(sale);
      return acc;
    }, {});
    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [visibleSales]);

  // Aggregate item quantities for items view
  const itemBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const sale of visibleSales) {
      for (const item of sale.sale_items) {
        const existing = map.get(item.product_name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += Number(item.subtotal);
        } else {
          map.set(item.product_name, {
            name: item.product_name,
            quantity: item.quantity,
            revenue: Number(item.subtotal),
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [visibleSales]);

  return (
    <div className="flex flex-col h-full">
      {/* Summary */}
      <div className="px-4 pt-3 pb-3 bg-white border-b border-slate-100">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <p className="text-xs text-slate-400 font-medium">Today's Sales</p>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(todayTotal)}</p>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="text-slate-300">
              {todaySales.length} transaction{todaySales.length !== 1 ? 's' : ''}
            </span>
            <span className="text-slate-300">{todayItems} items sold</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-slate-500">All-time revenue</span>
          </div>
          <span className="text-sm font-bold text-slate-900">{formatCurrency(allTimeTotal)}</span>
        </div>
        {historyDeleteEnabled && (
          <button
            onClick={handleClearHistory}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold active:scale-[0.98] transition-all border border-red-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all history
          </button>
        )}
      </div>

      {/* View toggle + Date filter */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 space-y-2">
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('receipts')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'receipts'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'items'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            Items Sold
          </button>
        </div>

        {/* Date filter chips */}
        {availableDates.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium flex-shrink-0">
              <ListFilter className="w-3 h-3" />
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedDate === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              All
            </button>
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedDate === date
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {formatDateLabel(date)}
              </button>
            ))}
          </div>
        )}

        {/* Filtered summary */}
        {selectedDate && (
          <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2">
            <span className="text-xs text-emerald-700 font-medium">
              {formatDateLabel(selectedDate)}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-600">
                {visibleSales.length} sale{visibleSales.length !== 1 ? 's' : ''}
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {formatCurrency(visibleTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">No sales yet</p>
            <p className="text-xs text-slate-300 mt-0.5">Completed payments will appear here</p>
          </div>
        ) : viewMode === 'receipts' ? (
          /* Receipts view */
          visibleSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No sales on this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dateGroups.map(([date, groupSales]) => {
                const dateTotal = groupSales.reduce((sum, s) => sum + Number(s.total), 0);
                return (
                  <div key={date}>
                    {!selectedDate && (
                      <div className="flex items-center justify-between px-1 mb-1.5">
                        <p className="text-xs font-semibold text-slate-500">
                          {formatDateLabel(date)}
                        </p>
                        <p className="text-xs font-bold text-slate-400">{formatCurrency(dateTotal)}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {groupSales.map((sale) => {
                        const expanded = expandedId === sale.id;
                        return (
                          <button
                            key={sale.id}
                            onClick={() => setExpandedId(expanded ? null : sale.id)}
                            className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden text-left transition-all"
                          >
                            <div className="p-3 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Receipt className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900">
                                    {formatCurrency(Number(sale.total))}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {sale.item_count} item{sale.item_count !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {formatTime(sale.created_at)}
                                </p>
                              </div>
                              {expanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              )}
                            </div>

                            {expanded && (
                              <div className="px-3 pb-3 pt-1 border-t border-slate-50 space-y-1.5">
                                {sale.sale_items.map((item: SaleItem) => (
                                  <div key={item.id} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">
                                      <span className="font-medium text-slate-800">{item.quantity}x</span>{' '}
                                      {item.product_name}
                                    </span>
                                    <span className="text-slate-500 font-medium">
                                      {formatCurrency(Number(item.subtotal))}
                                    </span>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                                  <span className="text-xs font-semibold text-slate-500">Total</span>
                                  <span className="text-sm font-bold text-emerald-600">
                                    {formatCurrency(Number(sale.total))}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-300 pt-1">
                                  {formatDateTime(sale.created_at)}
                                </p>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Items sold view */
          itemBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageIcon className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No items sold on this date</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <p className="text-xs font-semibold text-slate-500">
                  {itemBreakdown.length} product{itemBreakdown.length !== 1 ? 's' : ''} · {visibleItems} items
                </p>
                <p className="text-xs font-bold text-slate-400">{formatCurrency(visibleTotal)}</p>
              </div>
              {itemBreakdown.map((item, idx) => (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">
                        {item.quantity} sold
                      </span>
                      <span className="text-[10px] text-slate-300">|</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                  {/* Quantity bar */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${Math.round((item.quantity / itemBreakdown[0].quantity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
