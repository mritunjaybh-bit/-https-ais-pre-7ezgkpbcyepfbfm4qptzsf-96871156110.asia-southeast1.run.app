import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Copy, ArrowRight, Tag, Mail } from 'lucide-react';

interface EmailCaptureModalProps {
  onCouponClaimed?: (couponCode: string) => void;
}

export const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({ onCouponClaimed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimedCode, setClaimedCode] = useState('XINCHAO10');
  const [isCopied, setIsCopied] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'exit_intent' | 'timed_fallback'>('exit_intent');

  useEffect(() => {
    // 1. Check if already submitted previously (persistent suppression)
    const alreadySubmitted =
      typeof window !== 'undefined' &&
      (localStorage.getItem('caphe_email_subscriber_submitted') === 'true' ||
        Boolean(localStorage.getItem('caphe_subscriber_email')));

    if (alreadySubmitted) {
      return;
    }

    // 2. Check if already shown in the current browser session (session flag)
    const sessionShown =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('caphe_email_popup_session_shown') === 'true';

    if (sessionShown) {
      return;
    }

    const showModal = (source: 'exit_intent' | 'timed_fallback') => {
      // Re-verify flags right before opening
      if (
        sessionStorage.getItem('caphe_email_popup_session_shown') === 'true' ||
        localStorage.getItem('caphe_email_subscriber_submitted') === 'true'
      ) {
        return;
      }

      setTriggerSource(source);
      setIsOpen(true);
      sessionStorage.setItem('caphe_email_popup_session_shown', 'true');
    };

    // A. Exit-Intent Detection (Desktop: cursor moving towards closing tab / window top)
    const handleMouseLeave = (e: MouseEvent) => {
      // When clientY is close to 0 or negative, mouse is exiting the top of the viewport
      if (e.clientY <= 12) {
        showModal('exit_intent');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    // B. Timed Fallback (Mobile devices + users browsing without top exit: 24 seconds)
    const timedTimer = setTimeout(() => {
      showModal('timed_fallback');
    }, 24000);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timedTimer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send to server endpoint
      let serverSaved = false;
      try {
        const res = await fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            source: triggerSource,
            discountCode: 'XINCHAO10',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.discountCode) {
            setClaimedCode(data.discountCode);
          }
          serverSaved = true;
        }
      } catch (netErr) {
        console.warn('[Newsletter] /api/subscribers failed, trying admin fallback:', netErr);
      }

      // 2. Admin fallback if needed
      if (!serverSaved) {
        try {
          await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'subscribe',
              email: cleanEmail,
              source: triggerSource,
              discountCode: 'XINCHAO10',
            }),
          });
        } catch (adminErr) {
          console.warn('[Newsletter] Admin fallback save deferred:', adminErr);
        }
      }

      // 3. Persist locally to guarantee permanent suppression
      localStorage.setItem('caphe_email_subscriber_submitted', 'true');
      localStorage.setItem('caphe_subscriber_email', cleanEmail);

      // Also maintain offline list in localStorage
      try {
        const existingRaw = localStorage.getItem('caphe_subscribers_list') || '[]';
        const existingList = JSON.parse(existingRaw);
        if (Array.isArray(existingList) && !existingList.includes(cleanEmail)) {
          existingList.push(cleanEmail);
          localStorage.setItem('caphe_subscribers_list', JSON.stringify(existingList));
        }
      } catch {}

      setIsClaimed(true);
      if (onCouponClaimed) {
        onCouponClaimed('XINCHAO10');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      // Even if network fails, grant the discount code so user isn't punished
      localStorage.setItem('caphe_email_subscriber_submitted', 'true');
      localStorage.setItem('caphe_subscriber_email', cleanEmail);
      setIsClaimed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(claimedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      // Fallback
      setIsCopied(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#fff8f6] border border-[#d3c3c0] rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scale-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close discount modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#827472] hover:text-[#271310] hover:bg-[#ede0dc]/70 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Decorative Top Accent Banner */}
        <div className="h-2 w-full bg-linear-to-r from-[#785a00] via-[#feca4d] to-[#271310]" />

        <div className="p-7 sm:p-9 space-y-6">
          {/* Badge & Decorative Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4ecea] border border-[#d3c3c0] text-[#785a00] text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#feca4d] fill-[#feca4d]" />
              <span>Chao Ban • Welcome Gift</span>
            </div>

            <h3
              className="text-2xl sm:text-3xl font-serif font-bold text-[#271310] leading-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Get 10% Off Your First Order
            </h3>

            <p className="text-xs sm:text-sm text-[#504442] max-w-sm mx-auto leading-relaxed">
              Experience direct-trade Vietnamese coffees co-roasted with real butter, cacao, and sea salt. Enter your email to unlock your roastery discount code.
            </p>
          </div>

          {!isClaimed ? (
            /* Email Capture Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-[#827472] pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#d3c3c0] focus:border-[#785a00] focus:ring-2 focus:ring-[#feca4d]/40 rounded-xl text-xs sm:text-sm text-[#271310] placeholder-[#827472] outline-hidden transition-all shadow-2xs"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-700 font-medium pl-1">{errorMsg}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-[#271310] to-[#3d201c] hover:from-[#3d201c] hover:to-[#271310] text-[#feca4d] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#feca4d] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Claim 10% Discount</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Secondary Dismissal Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-[11px] text-[#827472] hover:text-[#271310] underline decoration-[#d3c3c0] transition-colors cursor-pointer"
                >
                  No thanks, I'll pay full price
                </button>
              </div>
            </form>
          ) : (
            /* Success State with Coupon Code */
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-[#feca4d]/60 text-center space-y-2">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 mb-1">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                  Discount Code Unlocked!
                </p>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-dashed border-[#785a00] font-mono text-base font-bold text-[#271310] tracking-widest shadow-2xs">
                    <Tag className="w-4 h-4 text-[#785a00]" />
                    <span>{claimedCode}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-2 rounded-xl bg-[#271310] hover:bg-[#3d201c] text-[#feca4d] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#504442]">
                  Apply this code at checkout to receive 10% off your entire cart total.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-5 rounded-xl bg-[#785a00] hover:bg-[#5f4700] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Continue Shopping & Enjoy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Privacy Note */}
          <div className="pt-2 border-t border-[#d3c3c0]/50 text-center">
            <p className="text-[10px] text-[#827472]">
              We respect your privacy. No spam — only roastery updates, freshly roasted arrivals & brewing guides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
