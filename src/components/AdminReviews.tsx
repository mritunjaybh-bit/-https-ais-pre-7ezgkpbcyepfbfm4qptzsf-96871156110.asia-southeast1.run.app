import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, RefreshCw, AlertCircle, MessageSquare } from 'lucide-react';
import type { ProductReview } from '../types.ts';

interface AdminReviewsProps {
  token: string | null;
  showToast: (msg: string) => void;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ token, showToast }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin?action=reviews', {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('[AdminReviews] Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [token]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'approve-review',
          id,
        }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
        );
        showToast('Review approved! Published to live storefront & awarded 50 Circle Beans to customer.');
      }
    } catch (err) {
      console.error('[AdminReviews] Error approving review:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'reject-review',
          id,
        }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
        );
        showToast('Review rejected.');
      }
    } catch (err) {
      console.error('[AdminReviews] Error rejecting review:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          action: 'delete-review',
          id,
        }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast('Review deleted.');
      }
    } catch (err) {
      console.error('[AdminReviews] Error deleting review:', err);
    }
  };

  const filtered = reviews.filter((r) => filter === 'all' || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3e2723] pb-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#c5a880]" />
            Customer Reviews Moderation Queue
          </h2>
          <p className="text-xs text-[#a8928e] mt-1">
            Only customers with a verified Delivered order can submit reviews. Once approved by the Owner, reviews appear on the product page and award 50 Beans to the reviewer.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReviews}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
              filter === st
                ? 'bg-[#c5a880] text-[#140b09]'
                : 'bg-[#1d1210] text-[#a8928e] border border-[#3e2723] hover:text-white'
            }`}
          >
            {st} ({reviews.filter((r) => st === 'all' || r.status === st).length})
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-12 text-center text-[#a8928e] space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#c5a880]" />
          <p className="text-xs">Loading moderation queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#1d1210] border border-[#3e2723] text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-[#504442] mx-auto" />
          <p className="text-sm font-serif font-bold text-white">No reviews found</p>
          <p className="text-xs text-[#a8928e]">
            {filter !== 'all'
              ? `No ${filter} reviews in the moderation queue.`
              : 'As customers receive their orders and submit verified tasting feedback, reviews will appear here for approval.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-[#1d1210] border border-[#3e2723] flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{r.customerName}</span>
                  <span className="text-[10px] text-[#827472] font-mono">
                    Order ID: {r.orderId} • {r.customerEmail}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      r.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : r.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {r.title && <h4 className="text-sm font-semibold text-white">{r.title}</h4>}
                <p className="text-xs text-[#d6c7c4] leading-relaxed italic">&quot;{r.comment}&quot;</p>
                <div className="text-[10px] text-[#827472]">
                  Target Product ID: <span className="font-mono text-[#c5a880]">{r.productId}</span> •{' '}
                  {new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {r.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(r.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-700 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve (+50 Beans)</span>
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => handleReject(r.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-700 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-950 text-rose-400 text-xs border border-white/10 hover:border-rose-800 cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
