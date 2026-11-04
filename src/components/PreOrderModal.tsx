import React, { useState } from 'react';
import { ProductItem } from '../types.ts';
import { Clock, X, CheckCircle2, AlertCircle, RefreshCw, Send } from 'lucide-react';

interface PreOrderModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PreOrderModal: React.FC<PreOrderModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = customerName.trim();
    const cleanContact = customerContact.trim();

    if (!cleanName || cleanName.length < 2) {
      setError('Please provide your name (at least 2 characters).');
      return;
    }
    if (!cleanContact || cleanContact.length < 5) {
      setError('Please provide a valid phone number or email address for reservation confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-pre-order',
          customerName: cleanName,
          customerContact: cleanContact,
          productId: product.id,
          productName: product.name,
          quantity,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Failed to record reservation. Please try again.');
      }
    } catch (err) {
      console.error('[PreOrder] Submission error:', err);
      setError('Network error connecting to roastery. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError(null);
    setCustomerName('');
    setCustomerContact('');
    setQuantity(1);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#1d1210] text-[#fcfbf7] rounded-2xl border border-[#c5a880]/40 p-6 sm:p-7 shadow-2xl relative space-y-5">
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-[#a3978f] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-white">
              Reservation Confirmed
            </h3>
            <p className="text-xs text-[#a3978f] leading-relaxed max-w-sm mx-auto">
              Thank you, <strong className="text-white">{customerName}</strong>. Your reservation for{' '}
              <strong className="text-[#c5a880]">{quantity}x {product.name}</strong> has been logged in our roastery schedule.
            </p>
            <p className="text-[11px] text-[#6e635d] border-t border-[#3e2723] pt-3">
              No payment has been charged today. Our roastery team will reach out to{' '}
              <span className="font-mono text-white">{customerContact}</span> once the batch is roasted and ready for dispatch.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Back to Collection
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#c5a880] text-[10px] uppercase font-bold tracking-[0.2em]">
                <Clock className="w-3.5 h-3.5" />
                <span>Pre-Order &amp; Batch Waitlist</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-white">
                Reserve: {product.name}
              </h3>
              <p className="text-xs text-[#a3978f] leading-relaxed">
                Reserve your allocation from our upcoming micro-batch. Zero online payment taken today.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3.5 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Mobile Number or Email *
                </label>
                <input
                  type="text"
                  required
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="e.g. +91 9876543210 or yourname@gmail.com"
                  className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3.5 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Quantity
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#c5a880]"
                  >
                    {[1, 2, 3, 4, 5, 10].map((q) => (
                      <option key={q} value={q}>
                        {q} {q === 1 ? 'Pack' : 'Packs'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Roast Batch
                  </label>
                  <div className="bg-[#140b09] border border-[#3e2723] rounded-xl px-3 py-2 text-[#a3978f] text-[11px]">
                    Upcoming Launch Release
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Notes / Grind Preference (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Coarse Phin Grind preferred"
                  className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3.5 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reserving...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Pre-Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
