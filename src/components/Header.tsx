import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { Currency, ActiveTab, SiteSettings } from '../types';
import {
  ShoppingBag,
  Globe,
  ChevronDown,
  Check,
  Clock,
  Volume2,
  VolumeX,
  Award
} from 'lucide-react';
import { formatPrice } from '../utils/formatCurrency';
import { CURRENCY_RATES } from '../data/coffeeData';
import { useMusic } from '../context/MusicContext';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cartCount: number;
  cartTotalINR: number;
  onOpenCart: () => void;
  onOpenMatcher: () => void;
  onOpenTracker: () => void;
  activeOrdersCount?: number;
  siteSettings?: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  cartCount,
  cartTotalINR,
  onOpenCart,
  onOpenMatcher,
  onOpenTracker,
  activeOrdersCount = 0,
  siteSettings,
}) => {
  const { isMuted, toggleMute } = useMusic();
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'VND'];
  const supportEmail = siteSettings?.publicContactEmail || siteSettings?.supportEmail || 'mritunjay.bhardwaj@caphevietnam.in';
  const isWaitlistMode = !siteSettings?.directCheckoutEnabled;
  const announcementText = siteSettings?.announcementBarText || 'A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.';

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#fcfbf7]/95 backdrop-blur-md border-b border-[#c5a880]/20 font-sans transition-colors duration-300">
      {/* Editorial Luxury Top Announcement Bar */}
      <div className="w-full bg-[#140d09] text-[#fcfbf7] text-[11px] py-2 px-4 font-light tracking-[0.2em] uppercase flex items-center justify-between border-b border-[#c5a880]/20">
        <div className="hidden lg:flex items-center gap-2 text-[#c5a880]">
          <span>{announcementText}</span>
        </div>
        <div className="mx-auto lg:mx-0 flex items-center gap-2 text-center">
          <span className="text-[#c5a880] tracking-widest font-normal">Vietnamese Heritage • Launching Soon in India</span>
          <span className="text-[#c5a880]">•</span>
          <a
            href={`mailto:${supportEmail}`}
            className="text-[#e5ded8] hover:text-[#c5a880] underline underline-offset-2 transition-colors"
          >
            {supportEmail}
          </a>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#c5a880] tracking-[0.25em]">
          <span>Cà Phê Việt Nam</span>
        </div>
      </div>

      {/* Main Top Header Bar: Logo & Restrained Luxury Tools */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="shrink-0">
          <Logo
            size="sm"
            showTagline={false}
            onClick={() => setActiveTab('shop')}
            className="cursor-pointer"
          />
        </div>

        {/* Right Tools: Discreet Music, Currency, Tracker, Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Discreet Music Toggle */}
          <button
            id="header-music-toggle-btn"
            type="button"
            onClick={toggleMute}
            title={!isMuted ? 'Mute ambient soundscape' : 'Play ambient soundscape'}
            aria-label={!isMuted ? 'Mute background music' : 'Play background music'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#c5a880]/30 hover:border-[#c5a880] text-[#6e635d] hover:text-[#140d09] transition-all duration-300 text-[11px] font-light tracking-wider uppercase cursor-pointer"
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#c5a880]" />
                <span className="hidden sm:inline">Sound: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#8c827a]" />
                <span className="hidden sm:inline text-[#8c827a]">Sound</span>
              </>
            )}
          </button>

          {/* Currency Dropdown Selector */}
          <div className="relative shrink-0" ref={currencyMenuRef}>
            <button
              id="currency-selector-button"
              type="button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="flex items-center gap-1 bg-white hover:bg-[#fbf9f5] border border-[#c5a880]/30 hover:border-[#c5a880] px-2.5 py-1.5 rounded-full text-xs font-light tracking-wider text-[#140d09] transition-colors cursor-pointer"
            >
              <Globe className="w-3 h-3 text-[#c5a880] shrink-0" />
              <span>{currency}</span>
              <ChevronDown className={`w-3 h-3 text-[#8c827a] transition-transform duration-300 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCurrencyDropdownOpen && (
              <div
                id="currency-dropdown-menu"
                className="absolute right-0 mt-2 w-48 bg-[#fcfbf7] border border-[#c5a880]/40 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in duration-200"
              >
                <div className="px-3 py-1 text-[9px] font-medium text-[#c5a880] uppercase tracking-[0.2em] border-b border-[#c5a880]/20">
                  Select Currency
                </div>
                {currencies.map((curr) => {
                  const meta = CURRENCY_RATES[curr];
                  const isSelected = currency === curr;
                  return (
                    <button
                      key={curr}
                      id={`select-currency-${curr.toLowerCase()}`}
                      type="button"
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#fbf9f5] transition-colors ${
                        isSelected ? 'font-medium text-[#c5a880] bg-[#140d09]/5' : 'text-[#140d09]'
                      }`}
                    >
                      <span className="text-xs">{curr} ({meta?.symbol})</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c5a880]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minimal Order Tracker Button */}
          <button
            id="header-track-order-btn"
            onClick={onOpenTracker}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-light tracking-wider uppercase rounded-full transition-all cursor-pointer border ${
              activeTab === 'track-order'
                ? 'bg-[#140d09] text-[#fcfbf7] border-[#c5a880]'
                : 'text-[#140d09] hover:border-[#c5a880] border-[#c5a880]/30'
            }`}
          >
            <Clock className="w-3 h-3 text-[#c5a880]" />
            <span className="hidden md:inline">Track</span>
            {activeOrdersCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
            )}
          </button>

          {/* Restrained Luxury Cart Button (Hidden in Waitlist Mode) */}
          {!isWaitlistMode && (
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              aria-label="Open shopping bag"
              className="flex items-center gap-2 bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-[#c5a880]/40"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#c5a880]" />
              <span className="text-xs font-light tracking-wider hidden sm:inline">
                {cartCount > 0 ? formatPrice(cartTotalINR, currency) : 'Bag'}
              </span>
              {cartCount > 0 && (
                <span className="bg-[#c5a880] text-[#140d09] text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Bar: Refined Hairline Style */}
      <div className="w-full border-t border-[#c5a880]/15 bg-[#fcfbf7]">
        <nav
          aria-label="Main Navigation"
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-start lg:justify-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar text-[11px] sm:text-xs tracking-[0.2em] uppercase font-light"
        >
          {[
            { id: 'shop', label: 'The Collection', href: '/' },
            { id: 'flavor-matcher', label: 'Taste Matcher', href: '/taste-matcher' },
            { id: 'heritage', label: 'Our Story', href: '/heritage' },
            { id: 'blog', label: 'Journal', href: '/blog' },
            { id: 'track-order', label: 'Track Order', href: '/track' },
          ].map((item) => {
            const isActive =
              item.id === 'blog'
                ? activeTab === 'blog' || activeTab === 'blog-post'
                : activeTab === item.id;

            return (
              <a
                key={item.id}
                id={`nav-tab-${item.id}`}
                href={item.href}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.button === 1) return;
                  e.preventDefault();
                  setActiveTab(item.id as ActiveTab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`shrink-0 whitespace-nowrap py-1 relative transition-colors duration-300 no-underline cursor-pointer ${
                  isActive
                    ? 'text-[#140d09] font-medium'
                    : 'text-[#8c827a] hover:text-[#140d09]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#c5a880]" />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
