import React, { useState } from 'react';
import { ProductItem } from '../types.ts';
import { Star, X, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react';

interface ReviewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [orderId, setOrderId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOrderId = orderId.trim();
    const cleanEmail = customerEmail.trim().toLowerCase();
    const cleanName = customerName.trim();
    const cleanComment = comment.trim();

    if (!cleanOrderId) {
      setError('Please provide your Order ID (from your confirmation email or invoice, e.g. CP-123456).');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter the email address used during your order.');
      return;
    }
    if (!cleanName) {
      setError('Please enter your name.');
      return;
    }
    if (!cleanComment || cleanComment.length < 10) {
      setError('Please share your tasting notes or review (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-review',
          productId: product.id,
          orderId: cleanOrderId,
          customerEmail: cleanEmail,
          customerName: cleanName,
          rating,
          title: title.trim() || undefined,
          comment: cleanComment,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('[ReviewModal] Submission error:', err);
      setError('Network error connecting to roastery. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError(null);
    setOrderId('');
    setCustomerEmail('');
    setCustomerName('');
    setRating(5);
    setTitle('');
    setComment('');
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
              Tasting Review Received
            </h3>
            <p className="text-xs text-[#a3978f] leading-relaxed max-w-sm mx-auto">
              Thank you for sharing your experience with{' '}
              <strong className="text-[#c5a880]">{product.name}</strong>. In accordance with our authenticity policy, our roastery team verifies the order before publishing.
            </p>
            <p className="text-[11px] text-[#6e635d] border-t border-[#3e2723] pt-3">
              Once verified and approved by the Roastery Owner, your review will appear live and{' '}
              <strong className="text-emerald-400">+50 Beans</strong> will be credited to your Cà Phê Circle account!
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#c5a880] text-[10px] uppercase font-bold tracking-[0.2em]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Tasting Review</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-white">
                Review: {product.name}
              </h3>
              <p className="text-xs text-[#a3978f] leading-relaxed">
                To guarantee 100% authentic feedback, reviews require a Delivered Order ID.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Delivered Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. CP-999888"
                    className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3 py-2 text-white font-mono placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                    Order Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ananya Sen"
                  className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3.5 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Rating *
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#a3978f] ml-2">
                    {rating === 5
                      ? 'Exceptional'
                      : rating === 4
                      ? 'Very Good'
                      : rating === 3
                      ? 'Good'
                      : rating === 2
                      ? 'Fair'
                      : 'Poor'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Headline (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rich dark cocoa aroma with velvet crema"
                  className="w-full bg-[#140b09] border border-[#3e2723] rounded-xl px-3.5 py-2 text-white placeholder:text-[#504442] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880] block mb-1">
                  Your Tasting Review *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the aroma, body, Phin extraction, and finish?"
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
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
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
