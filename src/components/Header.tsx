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
  Truck
} from 'lucide-react';
import { formatPrice } from '../utils/formatCurrency';
import { CURRENCY_RATES } from '../data/coffeeData';

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
    <header className="sticky top-0 z-40 bg-[#fff8f6]/95 backdrop-blur-md border-b border-[#d3c3c0]/40 transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-[#271310] text-[#f4eceb] text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-[#feca4d]">
          <Truck className="w-3.5 h-3.5" />
          <span>Fresh Single-Origin Ground Powders & Instant Coffee • Air Courier Dispatch Across India</span>
        </div>
        <div className="mx-auto flex items-center gap-2 text-[11px] md:text-xs">
          <span className="text-[#feca4d] font-semibold">Special Offer:</span>
          <span>
            Use code <strong className="text-white bg-[#3e2723] px-1.5 py-0.5 rounded border border-[#feca4d]/40">VIETNAM15</strong> for 15% off ground coffee powders & instant boxes
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-[#ae8d87]">
          <span>Fresh Nitrogen Sealed</span>
          <span>•</span>
          <span>Free Shipping &gt; ₹799</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo
          size="sm"
          showTagline={false}
          onClick={() => setActiveTab('shop')}
          className="cursor-pointer"
        />

        {/* Primary Screen Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#f4eceb] p-1 rounded-full border border-[#d3c3c0]/30 shadow-inner">
          <button
            id="nav-tab-shop"
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === 'shop'
                ? 'bg-[#271310] text-white shadow-sm'
                : 'text-[#504442] hover:text-[#271310] hover:bg-[#eae0de]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Coffee Powders & Shop</span>
          </button>

          <button
            id="nav-tab-flavoured"
            onClick={() => setActiveTab('flavoured')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === 'flavoured'
                ? 'bg-[#785a00] text-white shadow-sm'
                : 'text-[#504442] hover:text-[#271310] hover:bg-[#eae0de]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#feca4d]" />
            <span>Flavoured Coffees</span>
            <span className="bg-[#feca4d] text-[#271310] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider">
              Egg & Chocolate
            </span>
          </button>

          <button
            id="nav-tab-instant"
            onClick={() => setActiveTab('instant')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === 'instant'
                ? 'bg-[#271310] text-white shadow-sm'
                : 'text-[#504442] hover:text-[#271310] hover:bg-[#eae0de]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-[#785a00]" />
            <span>Instant & 3-in-1</span>
          </button>

          <button
            id="nav-tab-brew-studio"
            onClick={() => setActiveTab('brew-studio')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 relative ${
              activeTab === 'brew-studio'
                ? 'bg-[#785a00] text-white shadow-sm'
                : 'text-[#785a00] hover:bg-[#feca4d]/20 font-bold'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#feca4d] animate-pulse" />
            <span>Phin Brew Studio</span>
            <span className="bg-[#feca4d] text-[#271310] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider">
              Interactive
            </span>
          </button>

          <button
            id="nav-tab-flavor-matcher"
            onClick={() => setActiveTab('flavor-matcher')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === 'flavor-matcher'
                ? 'bg-[#271310] text-white shadow-sm'
                : 'text-[#504442] hover:text-[#271310] hover:bg-[#eae0de]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Taste Matcher</span>
          </button>

          <button
            id="nav-tab-heritage"
            onClick={() => setActiveTab('heritage')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === 'heritage'
                ? 'bg-[#271310] text-white shadow-sm'
                : 'text-[#504442] hover:text-[#271310] hover:bg-[#eae0de]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Heritage & Guides</span>
          </button>
        </nav>

        {/* Right Tools: Currency, Tracker, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Dropdown Selector */}
          <div className="relative" ref={currencyMenuRef}>
            <button
              id="currency-selector-button"
              type="button"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#271310] transition-colors shadow-2xs"
              title="Select your preferred currency"
            >
              <Globe className="w-3.5 h-3.5 text-[#785a00]" />
              <span>{CURRENCY_RATES[currency]?.label || 'INR (₹)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#827472] transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#271310] bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] rounded-lg transition-colors relative"
          >
            <Clock className="w-3.5 h-3.5 text-[#785a00]" />
            <span className="hidden sm:inline">Track Package</span>
            {activeOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#feca4d] animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>

          {/* Quick Flavor Finder Button */}
          <button
            id="header-taste-matcher-btn"
            onClick={onOpenMatcher}
            title="Discover your perfect Vietnamese coffee powder or instant mix"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#785a00] bg-[#feca4d]/20 hover:bg-[#feca4d]/30 border border-[#feca4d]/40 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Flavor Finder</span>
          </button>

          {/* Shopping Cart Button */}
          <button
            id="header-cart-button"
            onClick={onOpenCart}
            aria-label="Open shopping cart"
            className="relative flex items-center gap-2 bg-[#271310] text-white px-3.5 py-2 rounded-lg hover:bg-[#3e2723] active:scale-95 transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#feca4d]" />
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

      {/* Mobile Screen Tabs Scrolling Bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#d3c3c0]/30 bg-[#faf2f0] no-scrollbar">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full ${
            activeTab === 'shop'
              ? 'bg-[#271310] text-white'
              : 'bg-white/80 text-[#504442] border border-[#d3c3c0]/50'
          }`}
        >
          All Powders
        </button>
        <button
          onClick={() => setActiveTab('flavoured')}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 ${
            activeTab === 'flavoured'
              ? 'bg-[#785a00] text-white'
              : 'bg-white/80 text-[#504442] border border-[#d3c3c0]/50'
          }`}
        >
          <Sparkles className="w-3 h-3 text-[#feca4d]" />
          Flavoured
        </button>
        <button
          onClick={() => setActiveTab('instant')}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full ${
            activeTab === 'instant'
              ? 'bg-[#271310] text-white'
              : 'bg-white/80 text-[#504442] border border-[#d3c3c0]/50'
          }`}
        >
          Instant 3-in-1
        </button>
        <button
          onClick={() => setActiveTab('brew-studio')}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
            activeTab === 'brew-studio'
              ? 'bg-[#785a00] text-white font-bold'
              : 'bg-[#feca4d]/20 text-[#785a00] border border-[#feca4d]/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#feca4d]" />
          Phin Studio
        </button>
        <button
          onClick={() => setActiveTab('heritage')}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full ${
            activeTab === 'heritage'
              ? 'bg-[#271310] text-white'
              : 'bg-white/80 text-[#504442] border border-[#d3c3c0]/50'
          }`}
        >
          Heritage & Guides
        </button>
        <button
          onClick={onOpenTracker}
          className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 bg-[#feca4d]/15 text-[#785a00] border border-[#feca4d]/40"
        >
          <Clock className="w-3.5 h-3.5 text-[#785a00]" />
          <span>Track Package</span>
        </button>
      </div>
    </header>
  );
};
