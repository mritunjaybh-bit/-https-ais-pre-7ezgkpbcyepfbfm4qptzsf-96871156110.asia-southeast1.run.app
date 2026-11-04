import React, { useState, useEffect } from 'react';
import { ProductItem } from '../types.ts';
import { X, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  availableProducts?: ProductItem[];
  onSuccess?: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  product,
  availableProducts = [],
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setInterest(product.name);
    } else if (availableProducts.length > 0 && !interest) {
      setInterest(availableProducts[0].name);
    } else if (!interest) {
      setInterest('Vietnamese 3-in-1 Instant Coffee');
    }
  }, [product, availableProducts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!consent) {
      setError('Please tick the consent box to receive launch notifications.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          phone: phone.trim() || undefined,
          interest: interest.trim() || 'General Launch Range',
          consent: true,
          source: 'waitlist_modal',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Unable to join waitlist. Please try again.');
      }
    } catch (err) {
      console.error('[Waitlist] Error submitting entry:', err);
      setError('Connection error. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setError(null);
    setEmail('');
    setPhone('');
    setConsent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#140d09] text-[#fcfbf7] rounded-none border border-[#c5a880]/40 p-7 sm:p-9 shadow-2xl relative space-y-6">
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-[#a3978f] hover:text-[#c5a880] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/50 text-[#c5a880] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-[#fcfbf7] font-normal tracking-wide">
                You are on the list
              </h3>
              <p className="text-xs text-[#dcd4cb] font-light leading-relaxed max-w-sm mx-auto">
                Thank you for your interest in <span className="text-[#c5a880] font-medium">{interest}</span>. We will notify you at <span className="underline text-[#fcfbf7]">{email}</span> the moment launch batches open in India.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 cursor-pointer"
              >
                Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 border-b border-[#c5a880]/20 pb-4">
              <div className="flex items-center gap-2 text-[#c5a880] text-[10px] uppercase tracking-[0.25em]">
                <Clock className="w-3.5 h-3.5" />
                <span>Launching Soon in India</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#fcfbf7] tracking-wide">
                Join the Waitlist
              </h3>
              <p className="text-xs text-[#a3978f] font-light leading-relaxed">
                Be among the first to experience our initial release batches. Priority allocation and private invitation at launch.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 text-red-200 text-xs rounded-none">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Product of Interest */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-[#c5a880] mb-1.5">
                  Product of Interest
                </label>
                {availableProducts.length > 0 ? (
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 focus:border-[#c5a880] focus:outline-hidden"
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="Complete Collection">Full Range (All Varieties)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 focus:border-[#c5a880] focus:outline-hidden"
                  />
                )}
              </div>

              {/* Email (Required) */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-[#c5a880] mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 placeholder-[#6f645e] focus:border-[#c5a880] focus:outline-hidden"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-[#a3978f] mb-1.5">
                  Phone Number <span className="text-[10px] text-[#6f645e] lowercase font-light">(optional for SMS / WhatsApp notice)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 placeholder-[#6f645e] focus:border-[#c5a880] focus:outline-hidden"
                />
              </div>

              {/* Unticked Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#a3978f] font-light leading-relaxed select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded-none border-[#c5a880]/40 bg-[#1e1511] text-[#c5a880] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#c5a880]"
                  />
                  <span>
                    I agree to receive launch updates and product availability notifications.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Join the Waitlist</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
