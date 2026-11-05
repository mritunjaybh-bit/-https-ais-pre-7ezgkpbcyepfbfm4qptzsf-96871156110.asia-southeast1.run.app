import React, { useState } from 'react';
import { Logo } from './Logo';
import { ActiveTab, SiteSettings } from '../types';
import { LegalDocType } from './LegalPagesModal';
import { Check, Lock, MessageCircle } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTracker?: () => void;
  siteSettings?: SiteSettings;
  onOpenLegalDoc?: (doc: LegalDocType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenTracker,
  siteSettings,
  onOpenLegalDoc,
}) => {
  const { currentTrack } = useMusic();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer_roastery_dispatch' }),
      });
    } catch {
      // Ignore network error in fallback
    }
    setSubscribed(true);
    setEmail('');
  };

  const supportEmail = siteSettings?.publicContactEmail || siteSettings?.supportEmail || 'mritunjay.bhardwaj@caphevietnam.in';
  const whatsapp = siteSettings?.whatsappNumber;
  const fssai = siteSettings?.fssaiNumber;
  const gstin = siteSettings?.gstin;

  return (
    <>
      <footer className="w-full max-w-full overflow-hidden bg-[#140d09] text-[#fcfbf7] pt-16 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] border-t border-[#c5a880]/20 font-sans">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-[#c5a880]/20">
            {/* Brand Identity & Mission (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-block bg-[#fcfbf7] p-2.5 rounded-lg">
                <Logo size="sm" showTagline={false} />
              </div>
              <p className="text-xs text-[#a3978f] font-light leading-relaxed pr-4">
                A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.
              </p>

              {/* Customer Care Desk */}
              <div className="p-4 rounded-xl border border-[#c5a880]/20 bg-white/5 space-y-1">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block font-medium">
                  Customer Care & Inquiries
                </span>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-xs font-mono text-[#fcfbf7] hover:text-[#c5a880] transition-colors block"
                >
                  {supportEmail}
                </a>
                {whatsapp && (
                  <p className="text-[11px] text-[#a3978f] font-mono mt-0.5">
                    WhatsApp: {whatsapp}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Navigation (3 cols) */}
            <div className="lg:col-span-3 space-y-4 text-xs font-light">
              <h4 className="text-xs font-medium text-[#c5a880] uppercase tracking-[0.25em]">
                Navigation & Story
              </h4>
              <ul className="space-y-2.5 text-[#a3978f]">
                {[
                  { label: 'The Collection', tab: 'shop', href: '/' },
                  { label: 'Taste Matcher', tab: 'flavor-matcher', href: '/taste-matcher' },
                  { label: 'Our Story', tab: 'heritage', href: '/heritage' },
                  { label: 'The Journal', tab: 'blog', href: '/blog' },
                  { label: 'Track Order', tab: 'track-order', href: '/track' },
                  { label: 'Partner with us', tab: 'partner', href: '/partner' },
                  { label: 'Cà Phê Circle', tab: 'circle', href: '/circle' },
                ].map((link) => (
                  <li key={link.tab}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.button === 1) return;
                        e.preventDefault();
                        onSelectTab(link.tab as ActiveTab);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#fcfbf7] transition-colors cursor-pointer inline-block tracking-wider"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Private Dispatch List & Policies (4 cols) */}
            <div className="lg:col-span-4 space-y-4 text-xs font-light">
              <h4 className="text-xs font-medium text-[#c5a880] uppercase tracking-[0.25em]">
                Launch Updates
              </h4>
              <p className="text-[#a3978f] leading-relaxed">
                Be the first to know when we launch. No spam.
              </p>

              {subscribed ? (
                <div className="p-4 rounded-xl border border-[#c5a880]/40 bg-white/5 flex items-center gap-2.5 text-xs text-[#c5a880]">
                  <Check className="w-4 h-4 text-[#c5a880]" />
                  <span>You are subscribed to launch updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 bg-white/5 border border-[#c5a880]/30 rounded-full px-4 py-2 text-xs text-[#fcfbf7] placeholder:text-[#8c827a] focus:outline-none focus:border-[#c5a880] transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-medium rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Join
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8c827a]">No spam. We will only write when we launch.</p>
                </form>
              )}

              {/* Legal & Compliance Links */}
              <div className="pt-3 border-t border-[#c5a880]/15 space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] block font-medium">
                  Client Charter & Policies
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-[#8c827a]">
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('privacy')}
                    className="hover:text-[#fcfbf7] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('terms')}
                    className="hover:text-[#fcfbf7] transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('refunds')}
                    className="hover:text-[#fcfbf7] transition-colors cursor-pointer"
                  >
                    Refunds & Returns
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('shipping')}
                    className="hover:text-[#fcfbf7] transition-colors cursor-pointer"
                  >
                    Shipping Policy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('contact')}
                    className="hover:text-[#fcfbf7] transition-colors cursor-pointer"
                  >
                    Contact Us
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalDoc?.('faq')}
                    className="hover:text-[#fcfbf7] transition-colors cursor-pointer"
                  >
                    Knowledge & FAQ
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => onSelectTab('circle-terms')}
                    className="hover:text-[#c5a880] transition-colors cursor-pointer"
                  >
                    Circle Terms
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Registration Line (FSSAI, GSTIN, CIN, IEC displayed ONLY IF present in siteSettings) */}
          {(fssai || gstin || siteSettings?.cin || siteSettings?.iec) && (
            <div className="py-4 border-b border-[#c5a880]/15 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] text-[#a3978f] font-mono">
              {fssai && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#c5a880]">FSSAI Central Licence:</span>
                  <span>{fssai}</span>
                </div>
              )}
              {fssai && gstin && <span className="text-[#c5a880]/40">•</span>}
              {gstin && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#c5a880]">GSTIN:</span>
                  <span>{gstin}</span>
                </div>
              )}
              {siteSettings?.cin && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#c5a880]">CIN:</span>
                  <span>{siteSettings.cin}</span>
                </div>
              )}
              {siteSettings?.iec && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#c5a880]">IEC:</span>
                  <span>{siteSettings.iec}</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c827a] font-light">
            <p className="text-center sm:text-left">
              {siteSettings?.footerLegalLine || 'Cà Phê is a brand of SuleVina Global Ventures (OPC) Private Limited (incorporation in progress).'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-[11px]">
              {currentTrack?.title && currentTrack?.artist && (
                <>
                  <span className="text-[#a3978f]">Music: {currentTrack.title}, {currentTrack.artist}</span>
                  <span>•</span>
                </>
              )}
              <span>Vietnamese Heritage</span>
              <span>•</span>
              <span>Launching Soon</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Customer Care Button (ONLY displayed if whatsappNumber is set in Site Settings) */}
      {whatsapp && (
        <aside aria-label="Customer Support">
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Customer Care on WhatsApp"
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group cursor-pointer border-2 border-white/20"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium tracking-wide max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
              Customer Care
            </span>
          </a>
        </aside>
      )}
    </>
  );
};
