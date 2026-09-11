import { useState } from 'react';
import { Package, ShoppingCart, Receipt, Plus } from 'lucide-react';
import { InventoryView } from '@/views/InventoryView';
import { CashierView } from '@/views/CashierView';
import { HistoryView } from '@/views/HistoryView';

type Tab = 'cashier' | 'inventory' | 'history';

function App() {
  const [tab, setTab] = useState<Tab>('cashier');

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'cashier', label: 'Cashier', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'history', label: 'History', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Plus className="w-5 h-5 text-white rotate-45" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">QuickPOS</h1>
            <p className="text-[10px] text-slate-400 leading-tight">Point of Sale</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20" key={tab}>
        {tab === 'cashier' && <CashierView />}
        {tab === 'inventory' && <InventoryView />}
        {tab === 'history' && <HistoryView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-1.5 z-40 w-full">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 flex-1 ${
                active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
