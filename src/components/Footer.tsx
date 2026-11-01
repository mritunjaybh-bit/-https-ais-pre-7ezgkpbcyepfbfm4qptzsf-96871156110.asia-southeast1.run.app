import React, { useState } from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../types';
import { Mail, Check, Lock, ArrowRight } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTracker?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenTracker }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="w-full max-w-full overflow-hidden bg-[#140d09] text-[#fcfbf7] pt-16 pb-12 border-t border-[#c5a880]/20 font-sans">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-[#c5a880]/20">
          {/* Brand Identity & Mission (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-block bg-[#fcfbf7] p-2.5 rounded-lg">
              <Logo size="sm" showTagline={false} />
            </div>
            <p className="text-xs text-[#a3978f] font-light leading-relaxed pr-4">
              Direct-trade artisanal Vietnamese ground coffee powders, instant 3-in-1 condensed milk sachets, pure freeze-dried crystals, and stainless steel Phin gravity brewing kits. Sourced directly from heirloom micro-lot farmers in Buôn Ma Thuột & Đà Lạt.
            </p>

            {/* Orders Update & Roastery Desk */}
            <div className="p-4 rounded-xl border border-[#c5a880]/20 bg-white/5 space-y-1">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] block font-medium">
                Client Concierge & Inquiries
              </span>
              <a
                href="mailto:support@caphevietnam.in"
                className="text-xs font-mono text-[#fcfbf7] hover:text-[#c5a880] transition-colors"
              >
                support@caphevietnam.in
              </a>
            </div>
          </div>

          {/* Quick Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-xs font-light">
            <h4 className="text-xs font-medium text-[#c5a880] uppercase tracking-[0.25em]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-[#a3978f]">
              {[
                { label: 'The Collection', tab: 'shop', href: '/' },
                { label: 'Flavoured Specialty', tab: 'flavoured', href: '/flavoured' },
                { label: 'Instant 3-in-1', tab: 'instant', href: '/instant' },
                { label: 'Phin Gravity Studio', tab: 'brew-studio', href: '/brew-studio' },
                { label: 'Taste Matcher', tab: 'flavor-matcher', href: '/taste-matcher' },
                { label: 'Heritage Terroirs', tab: 'heritage', href: '/heritage' },
                { label: 'The Journal', tab: 'blog', href: '/blog' },
                { label: 'Track Order', tab: 'track-order', href: '/track' },
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

          {/* Private Dispatch List (4 cols) */}
          <div className="lg:col-span-4 space-y-4 text-xs font-light">
            <h4 className="text-xs font-medium text-[#c5a880] uppercase tracking-[0.25em]">
              The Roastery Dispatch
            </h4>
            <p className="text-[#a3978f] leading-relaxed">
              Receive private notices for micro-lot harvest releases, seasonal roasts, and traditional brewing dispatches.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-xl border border-[#c5a880]/40 bg-white/5 flex items-center gap-2.5 text-xs text-[#c5a880]">
                <Check className="w-4 h-4 text-[#c5a880]" />
                <span>You are subscribed to the private roastery dispatch.</span>
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
                <p className="text-[10px] text-[#8c827a]">No spam. Strictly seasonal roastery announcements.</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c827a] font-light">
          <p>© {new Date().getFullYear()} Cà Phê Việt Nam. Direct-Trade Vietnamese Coffee.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Volcanic Basalt Terroirs</span>
            <span>•</span>
            <span>Valve Degassing Seal</span>
            <span>•</span>
            <a
              href="/admin"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.button === 1) return;
                e.preventDefault();
                onSelectTab('admin');
                try {
                  window.history.pushState({}, '', '/admin');
                } catch {
                  // Ignore
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#c5a880] transition-colors flex items-center gap-1 cursor-pointer"
              title="Roastery Owner Portal"
            >
              <Lock className="w-3 h-3 text-[#c5a880]" />
              <span>Owner Portal</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
