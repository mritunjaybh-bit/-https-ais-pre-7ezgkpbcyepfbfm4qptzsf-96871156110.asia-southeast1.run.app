import React, { useState, useEffect } from 'react';
import { Award, Search, RefreshCw, Users, Gift, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import type { CircleMember } from '../types.ts';

interface AdminCircleProps {
  token: string | null;
  showToast: (msg: string) => void;
}

export const AdminCircle: React.FC<AdminCircleProps> = ({ token, showToast }) => {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin?action=circle-members', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('[AdminCircle] Error loading circle members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [token]);

  const totalMembers = members.length;
  const totalBeans = members.reduce((sum, m) => sum + (m.beansBalance || 0), 0);
  const totalSpend = members.reduce((sum, m) => sum + (m.lifetimeSpendINR || 0), 0);

  const filtered = members.filter(
    (m) =>
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
      (m.referralCode && m.referralCode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3e2723] pb-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#c5a880]" />
            Cà Phê Circle Rewards &amp; Members
          </h2>
          <p className="text-xs text-[#a8928e] mt-1">
            Loyalty membership tier tracking (Origin, Reserve, Grand Cru), Beans balances, referral links, and ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMembers}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Total Members</div>
          <div className="text-2xl font-bold font-serif text-white">{totalMembers}</div>
          <div className="text-[11px] text-[#a8928e]">Registered coffee connoisseurs</div>
        </div>
        <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Outstanding Beans</div>
          <div className="text-2xl font-bold font-serif text-[#c5a880]">{totalBeans.toLocaleString()}</div>
          <div className="text-[11px] text-[#a8928e]">Worth approx. ₹{Math.floor((totalBeans / 100) * 5).toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#1d1210] border border-[#3e2723] space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#827472] tracking-wider">Member Lifetime Spend</div>
          <div className="text-2xl font-bold font-serif text-emerald-400">₹{totalSpend.toLocaleString()}</div>
          <div className="text-[11px] text-[#a8928e]">Across delivered orders</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#827472]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by member email, name or referral code..."
          className="w-full bg-[#1d1210] border border-[#3e2723] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
        />
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#a8928e] space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#c5a880]" />
          <p className="text-xs">Loading Circle roster...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#1d1210] border border-[#3e2723] text-center space-y-2">
          <Users className="w-8 h-8 text-[#504442] mx-auto" />
          <p className="text-sm font-serif font-bold text-white">No Circle members yet</p>
          <p className="text-xs text-[#a8928e]">
            Customers earn 100 Beans on joining and 1 Bean per ₹1 on Delivered orders.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1d1210] border border-[#3e2723] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#f5ebe6]">
              <thead className="bg-[#140b09] text-[10px] uppercase font-bold tracking-wider text-[#a8928e] border-b border-[#3e2723]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Beans Balance</th>
                  <th className="py-3 px-4">12-Mo Spend</th>
                  <th className="py-3 px-4">Referral Code</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a1714]">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{m.name || 'Coffee Connoisseur'}</div>
                      <div className="text-[11px] text-[#827472] font-mono">{m.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.tier === 'Grand Cru'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : m.tier === 'Reserve'
                            ? 'bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/40'
                            : 'bg-white/10 text-[#d6c7c4] border border-white/10'
                        }`}
                      >
                        {m.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#c5a880] text-sm">{m.beansBalance}</span>
                      <span className="text-[10px] text-[#827472] ml-1">Beans (₹{Math.floor((m.beansBalance / 100) * 5)})</span>
                    </td>
                    <td className="py-3 px-4 font-mono">₹{m.lifetimeSpendINR || 0}</td>
                    <td className="py-3 px-4 font-mono text-[#c5a880] font-bold">{m.referralCode}</td>
                    <td className="py-3 px-4 text-[#827472] whitespace-nowrap">
                      {new Date(m.joinedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(m)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] border border-white/10 cursor-pointer"
                      >
                        History ({m.history?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1d1210] rounded-2xl border border-[#3e2723] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3e2723] pb-3">
              <div>
                <h3 className="font-serif font-bold text-white text-base">
                  Beans Ledger: {selectedMember.name || selectedMember.email}
                </h3>
                <p className="text-xs text-[#a8928e] font-mono">{selectedMember.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {(selectedMember.history || []).map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-[#140b09] border border-[#3e2723] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{h.description}</div>
                    <div className="text-[10px] text-[#827472]">
                      {new Date(h.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div
                    className={`font-bold font-mono text-sm ${
                      h.beans >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {h.beans >= 0 ? `+${h.beans}` : `${h.beans}`} Beans
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
