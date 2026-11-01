import React, { useState, useEffect } from 'react';
import { setCookieConsent, hasCookieConsent, initMetaPixelFromSettings } from '../utils/metaPixel';
import { ShieldCheck } from 'lucide-react';

interface CookieConsentProps {
  metaPixelId?: string;
  onOpenPrivacyPolicy?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  metaPixelId,
  onOpenPrivacyPolicy,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('caphe_cookie_consent');
      if (!stored) {
        // Small delay so it smoothly appears without interrupting initial render
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else if (stored === 'accepted' && metaPixelId) {
        initMetaPixelFromSettings(metaPixelId);
      }
    } catch {
      // Ignore in private modes
    }
  }, [metaPixelId]);

  const handleAccept = () => {
    setCookieConsent(true);
    setIsVisible(false);
    if (metaPixelId) {
      initMetaPixelFromSettings(metaPixelId);
    }
  };

  const handleDecline = () => {
    setCookieConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#140d09]/95 text-[#fcfbf7] backdrop-blur-md border border-[#c5a880]/40 rounded-2xl p-4 sm:p-5 shadow-2xl font-sans animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#c5a880]/20 border border-[#c5a880]/30 flex items-center justify-center shrink-0 text-[#c5a880]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-medium">
              Privacy & Consent
            </span>
          </div>
          <p className="text-[11px] text-[#d8cfca] font-light leading-relaxed">
            We use essential cookies to manage your cart and optional analytics to refine our direct-trade coffee experience. No personally identifiable tracking data is ever brokered.
          </p>
          {onOpenPrivacyPolicy && (
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-[10px] text-[#c5a880] hover:text-[#fcfbf7] underline underline-offset-2 transition-colors cursor-pointer block"
            >
              Read our Privacy & Data Policy
            </button>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 py-1.5 px-3 rounded-full bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="py-1.5 px-3 rounded-full border border-[#c5a880]/30 hover:border-[#c5a880] text-[#a3978f] hover:text-[#fcfbf7] text-[11px] font-light uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
