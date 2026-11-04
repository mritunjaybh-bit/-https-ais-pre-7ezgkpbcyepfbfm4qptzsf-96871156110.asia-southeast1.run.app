import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, RefreshCw, CheckCircle2, Phone, Mail, Package } from 'lucide-react';
import type { PreOrderRecord } from '../types.ts';

interface AdminPreOrdersProps {
  token: string | null;
  showToast: (msg: string) => void;
}

export const AdminPreOrders: React.FC<AdminPreOrdersProps> = ({ token, showToast }) => {
  const [preOrders, setPreOrders] = useState<PreOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted' | 'fulfilled' | 'cancelled'>('all');

  const loadPreOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin?action=pre-orders', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPreOrders(data.preOrders || []);
      }
    } catch (err) {
      console.error('[AdminPreOrders] Error loading pre-orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreOrders();
  }, [token]);

  const handleUpdateStatus = async (id: string, status: PreOrderRecord['status']) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'update-pre-order-status',
          id,
          status,
        }),
      });
      if (res.ok) {
        setPreOrders((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        showToast(`Pre-order marked as ${status}`);
      }
    } catch (err) {
      console.error('[AdminPreOrders] Failed to update status:', err);
    }
  };

  const filtered = preOrders.filter((item) => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3e2723] pb-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#c5a880]" />
            Pre-Orders & Waitlist Reservations
          </h2>
          <p className="text-xs text-[#a8928e] mt-1">
            Customers who reserved coffee during Pre-Order mode or joined the waitlist for launch releases.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPreOrders}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone or coffee name..."
            className="w-full bg-[#1d1210] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'contacted', 'fulfilled', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                filterStatus === st
                  ? 'bg-[#c5a880] text-[#140b09]'
                  : 'bg-[#1d1210] text-[#a8928e] border border-[#3e2723] hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#a8928e] space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#c5a880]" />
          <p className="text-xs">Loading waitlist reservations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#1d1210] border border-[#3e2723] text-center space-y-2">
          <Package className="w-8 h-8 text-[#504442] mx-auto" />
          <p className="text-sm font-serif font-bold text-white">No pre-orders found</p>
          <p className="text-xs text-[#a8928e]">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search query or filter.'
              : 'When Pre-Order mode is activated or out-of-stock items are waitlisted, reservations will display here.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1d1210] border border-[#3e2723] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5ebe6]">
              <thead className="bg-[#140b09] text-[10px] uppercase font-bold tracking-wider text-[#a8928e] border-b border-[#3e2723]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Product Reserved</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a1714]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[#827472] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{item.customerName}</td>
                    <td className="py-3 px-4 font-mono text-[#c5a880]">{item.customerContact}</td>
                    <td className="py-3 px-4 text-white font-medium">{item.productName}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'fulfilled'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : item.status === 'contacted'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                            : item.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {item.status !== 'contacted' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'contacted')}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-sky-300 border border-white/10 cursor-pointer"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {item.status !== 'fulfilled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'fulfilled')}
                          className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-[10px] text-emerald-300 border border-emerald-700 cursor-pointer"
                        >
                          Mark Fulfilled
                        </button>
                      )}
                      {item.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                          className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-[10px] text-rose-300 border border-rose-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
