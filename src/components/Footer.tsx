import React, { useState } from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../types';
import { Mail, Phone, MapPin, Heart, Send, Check, ShieldCheck, Truck, Package } from 'lucide-react';

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
    <footer className="bg-[#271310] text-[#f4eceb] pt-14 pb-10 border-t border-[#3e2723]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#3e2723]">
          {/* Brand Identity & Mission (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-block bg-[#fff8f6] p-3 rounded-lg">
              <Logo size="sm" showTagline={true} />
            </div>
            <p className="text-xs text-[#ae8d87] leading-relaxed pr-4">
              Direct-trade artisanal Vietnamese ground coffee powders, instant 3-in-1 condensed milk sachets, pure freeze-dried crystals, and stainless steel Phin gravity brewing kits. Sourced directly from heirloom micro-lot farmers in Buôn Ma Thuột & Đà Lạt.
            </p>
            <div className="text-xs text-[#feca4d] font-semibold flex items-center gap-1.5 pt-1">
              <span>☕ 100% Volcanic Basalt Earth • Nitrogen Sealed Valve Pouches</span>
            </div>
          </div>

          {/* Quick Screen Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4
              className="text-sm font-bold text-white font-serif uppercase tracking-wider"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Shop Catalog
            </h4>
            <ul className="space-y-2 text-[#ae8d87]">
              <li>
                <button
                  onClick={() => onSelectTab('shop')}
                  className="hover:text-[#feca4d] transition-colors"
                >
                  All Coffee Powders & Beans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('instant')}
                  className="hover:text-[#feca4d] transition-colors"
                >
                  Instant Coffee Sachets & Jars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('brew-studio')}
                  className="hover:text-[#feca4d] transition-colors font-semibold text-[#feca4d]"
                >
                  Live Phin Brew Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('flavor-matcher')}
                  className="hover:text-[#feca4d] transition-colors"
                >
                  Coffee Taste Matcher
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('heritage')}
                  className="hover:text-[#feca4d] transition-colors"
                >
                  Central Highlands Origins
                </button>
              </li>
              {onOpenTracker && (
                <li>
                  <button
                    onClick={onOpenTracker}
                    className="hover:text-[#feca4d] transition-colors text-white/90 font-medium flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5 text-[#feca4d]" />
                    <span>Track Courier Package</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter Subscription (4 cols) */}
          <div className="lg:col-span-4 space-y-3 text-xs">
            <h4
              className="text-sm font-bold text-white font-serif uppercase tracking-wider"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Roastery Dispatch Club
            </h4>
            <p className="text-[#ae8d87] leading-relaxed">
              Subscribe for harvest drops, 15% off first orders, and exclusive micro-lot tasting flights.
            </p>

            {subscribed ? (
              <div className="bg-[#3e2723] p-3 rounded-lg border border-[#feca4d]/40 flex items-center gap-2 text-emerald-400 font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Welcome! Check your inbox for voucher code VIETNAM15.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 bg-[#180b09] border border-[#504442] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[#827472] focus:outline-none focus:border-[#feca4d]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </button>
                </div>
                <p className="text-[10px] text-[#827472]">Zero spam. Only fresh roast releases.</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#ae8d87]">
          <p>© {new Date().getFullYear()} Cà Phê Việt Nam. Direct-Trade Coffee Powders & Instant Blends.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Fast Express Courier All-India</span>
            <span>•</span>
            <span>Degassing Valve Sealed</span>
            <span>•</span>
            <span>100% Robusta & Arabica</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
