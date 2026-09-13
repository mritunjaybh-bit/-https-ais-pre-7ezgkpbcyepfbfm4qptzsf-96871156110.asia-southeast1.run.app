import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { Currency, ActiveTab } from '../types';
import {
  ShoppingBag,
  Sparkles,
  Coffee,
  Compass,
  Layers,
  Flame,
  MapPin,
  Globe,
  ChevronDown,
  Check,
  Clock,
  Package,
  Truck,
  Mail,
  Volume2,
  VolumeX
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

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#fff8f6]/95 backdrop-blur-md border-b border-[#d3c3c0]/40 transition-colors duration-200 overflow-x-clip">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#271310] text-[#f4eceb] text-xs py-1.5 px-3 sm:px-4 font-medium tracking-wide flex items-center justify-between overflow-hidden">
        <div className="hidden xl:flex items-center gap-2 text-[#feca4d] truncate shrink min-w-0">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Fresh Single-Origin Ground Powders & Instant Coffee • Air Courier Dispatch Across India</span>
        </div>
        <div className="mx-auto flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-center shrink min-w-0 flex-wrap">
          <span className="text-[#feca4d] font-semibold flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Customer Care & Support:</span>
            <span className="xs:hidden">Support:</span>
          </span>
          <a
            href="mailto:support@caphevietnam.in"
            className="text-white hover:text-[#feca4d] underline font-medium transition-colors truncate"
          >
            support@caphevietnam.in
          </a>
        </div>
        <div className="hidden xl:flex items-center gap-4 text-[11px] text-[#ae8d87] shrink-0">
          <span>Fresh Nitrogen Sealed</span>
          <span>•</span>
          <span>Free Shipping &gt; ₹799</span>
        </div>
      </div>

      {/* Main Top Header Bar: Logo & Utility Controls */}
      <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 min-w-0">
        {/* Brand Logo */}
        <div className="shrink-0">
          <Logo
            size="sm"
            showTagline={false}
            onClick={() => setActiveTab('shop')}
            className="cursor-pointer"
          />
        </div>

        {/* Right Tools: Currency, Tracker, Music, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          {/* Currency Dropdown Selector */}
          <div className="relative shrink-0" ref={currencyMenuRef}>
            <button
              id="currency-selector-button"
              type="button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="flex items-center gap-1 bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#271310] transition-colors shadow-2xs cursor-pointer"
              title="Select your preferred currency"
            >
              <Globe className="w-3.5 h-3.5 text-[#785a00] shrink-0" />
              <span className="text-[11px] sm:text-xs">{CURRENCY_RATES[currency]?.symbol || '₹'}</span>
              <span className="hidden sm:inline text-xs">{currency}</span>
              <ChevronDown className={`w-3 h-3 text-[#827472] transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Currency Dropdown Menu */}
            {isCurrencyDropdownOpen && (
              <div
                id="currency-dropdown-menu"
                className="absolute right-0 mt-1.5 w-48 bg-[#fff8f6] border border-[#d3c3c0] rounded-xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3 py-1 text-[10px] font-bold text-[#827472] uppercase tracking-wider border-b border-[#d3c3c0]/40">
                  Select Currency (Default: INR)
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
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#faf2f0] transition-colors ${
                        isSelected ? 'font-bold text-[#785a00] bg-[#feca4d]/10' : 'text-[#271310]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {curr} ({meta?.symbol})
                        </span>
                        <span className="text-[10px] text-[#827472]">{meta?.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#785a00]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Track Order Status Button */}
          <button
            id="header-track-order-btn"
            onClick={onOpenTracker}
            title="Track real-time coffee delivery status"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors relative cursor-pointer border shrink-0 ${
              activeTab === 'track-order'
                ? 'bg-[#271310] text-white border-[#271310] shadow-xs'
                : 'text-[#271310] bg-[#faf2f0] hover:bg-[#eee3e1] border-[#d3c3c0]'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'track-order' ? 'text-[#feca4d]' : 'text-[#785a00]'}`} />
            <span className="hidden md:inline">Track Order</span>
            {activeOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#feca4d] animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          {/* Vietnamese Background Ambient Music Mute/Unmute Toggle Button */}
          <button
            id="header-music-toggle-btn"
            type="button"
            onClick={toggleMute}
            title={!isMuted ? 'Mute traditional Vietnamese instrumental music' : 'Play traditional Vietnamese music (Đàn Tranh & Đàn Bầu)'}
            aria-label={!isMuted ? 'Mute background music' : 'Play background music'}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 shrink-0 cursor-pointer ${
              !isMuted
                ? 'bg-[#feca4d] text-[#271310] border-[#feca4d] shadow-xs hover:bg-[#ffc02e] active:scale-95'
                : 'bg-[#faf2f0] text-[#504442] hover:text-[#271310] hover:bg-[#eee3e1] border-[#d3c3c0] active:scale-95'
            }`}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#271310] shrink-0" />
                <span className="hidden md:inline text-[11px] font-bold">♫ Music</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#827472] shrink-0" />
                <span className="hidden md:inline text-[11px]">Music</span>
              </>
            )}
          </button>

          {/* Quick Flavor Finder Button */}
          <button
            id="header-taste-matcher-btn"
            onClick={onOpenMatcher}
            title="Discover your perfect Vietnamese coffee powder or instant mix"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#785a00] bg-[#feca4d]/20 hover:bg-[#feca4d]/30 border border-[#feca4d]/40 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Flavor Finder</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            id="header-cart-button"
            onClick={onOpenCart}
            aria-label="Open shopping cart"
            className="relative flex items-center gap-1.5 sm:gap-2 bg-[#271310] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg hover:bg-[#3e2723] active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#feca4d] shrink-0" />
            <span className="text-xs font-semibold hidden md:inline">
              {cartCount > 0 ? formatPrice(cartTotalINR, currency) : 'Cart'}
            </span>
            {cartCount > 0 && (
              <span className="bg-[#feca4d] text-[#271310] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary Navigation Bar (Coffee Powders & Shop, Flavoured Coffees, etc.) */}
      {/* Wrapped in a dedicated, scroll-contained container that wraps or scrolls horizontally within its own container without pushing the page width */}
      <div className="w-full border-t border-[#d3c3c0]/30 bg-[#faf2f0]/95 backdrop-blur-xs overflow-hidden">
        <nav
          aria-label="Main Navigation"
          className="w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-start lg:justify-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full no-scrollbar min-w-0"
        >
          <button
            id="nav-tab-shop"
            onClick={() => setActiveTab('shop')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-[#271310] text-white shadow-xs'
                : 'bg-white/80 text-[#504442] hover:text-[#271310] hover:bg-[#eae0de] border border-[#d3c3c0]/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Coffee Powders & Shop</span>
          </button>

          <button
            id="nav-tab-flavoured"
            onClick={() => setActiveTab('flavoured')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'flavoured'
                ? 'bg-[#785a00] text-white shadow-xs'
                : 'bg-white/80 text-[#504442] hover:text-[#271310] hover:bg-[#eae0de] border border-[#d3c3c0]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#feca4d] shrink-0" />
            <span>Flavoured Coffees</span>
            <span className="bg-[#feca4d] text-[#271310] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider">
              Egg & Chocolate
            </span>
          </button>

          <button
            id="nav-tab-instant"
            onClick={() => setActiveTab('instant')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-[#271310] text-white shadow-xs'
                : 'bg-white/80 text-[#504442] hover:text-[#271310] hover:bg-[#eae0de] border border-[#d3c3c0]/40'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-[#785a00] shrink-0" />
            <span>Instant & 3-in-1</span>
          </button>

          <button
            id="nav-tab-brew-studio"
            onClick={() => setActiveTab('brew-studio')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'brew-studio'
                ? 'bg-[#785a00] text-white shadow-xs font-bold'
                : 'bg-[#feca4d]/20 text-[#785a00] hover:bg-[#feca4d]/30 border border-[#feca4d]/40'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#feca4d] animate-pulse shrink-0" />
            <span>Phin Brew Studio</span>
            <span className="bg-[#feca4d] text-[#271310] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider">
              Interactive
            </span>
          </button>

          <button
            id="nav-tab-flavor-matcher"
            onClick={() => setActiveTab('flavor-matcher')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'flavor-matcher'
                ? 'bg-[#271310] text-white shadow-xs'
                : 'bg-white/80 text-[#504442] hover:text-[#271310] hover:bg-[#eae0de] border border-[#d3c3c0]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Taste Matcher</span>
          </button>

          <button
            id="nav-tab-heritage"
            onClick={() => setActiveTab('heritage')}
            className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'heritage'
                ? 'bg-[#271310] text-white shadow-xs'
                : 'bg-white/80 text-[#504442] hover:text-[#271310] hover:bg-[#eae0de] border border-[#d3c3c0]/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Heritage & Guides</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
