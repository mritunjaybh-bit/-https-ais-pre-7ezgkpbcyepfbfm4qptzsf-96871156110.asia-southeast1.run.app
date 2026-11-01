import React from 'react';
import { ActiveTab } from '../types';
import { ArrowRight, Compass } from 'lucide-react';

interface HeroBannerProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMatcher: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectTab,
  onOpenMatcher,
}) => {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-[#140d09] text-[#fcfbf7] border-b border-[#c5a880]/20 py-20 sm:py-28 lg:py-36 font-sans">
      {/* Background Editorial Ambient Lighting */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a170e]/60 via-[#140d09] to-[#0c0806]" />
        <div className="absolute -top-40 right-0 w-96 h-96 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Story & Pure Editorial Typography (7 cols) */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Super Header Tagline */}
            <div className="inline-flex items-center gap-2 text-[#c5a880] text-[10px] font-medium tracking-[0.3em] uppercase border-b border-[#c5a880]/40 pb-1">
              <span>Maison de Cà Phê • Vietnamese Artisanal Roasters</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] font-serif text-[#fcfbf7]">
                Single-origin. <br />
                <span className="italic font-serif text-[#c5a880]">Slow-roasted.</span> <br />
                Vietnamese tradition.
              </h1>
              <p className="text-sm sm:text-base text-[#a3978f] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Direct trade harvests from the ancient basalt soils of Buôn Ma Thuột and the misty cloud plateaus of Đà Lạt. Precision ground for gravity Phin extraction, accompanied by tailored masterclass brew recipes for every roast.
              </p>
            </div>

            {/* Refined Luxury Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-shop-coffee-btn"
                onClick={() => onSelectTab('shop')}
                className="px-8 py-4 rounded-full bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="hero-instant-matcher-btn"
                onClick={onOpenMatcher}
                className="px-7 py-4 rounded-full bg-transparent hover:bg-white/5 text-[#fcfbf7] border border-[#c5a880]/40 hover:border-[#c5a880] font-light text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <span>Find Your Profile</span>
              </button>
            </div>

            {/* Terroirs Row */}
            <div className="pt-8 border-t border-[#c5a880]/20 grid grid-cols-3 gap-6 text-left">
              <div>
                <span className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] block mb-1">01 / Terroir</span>
                <p className="text-xs font-serif text-[#fcfbf7]">Buôn Ma Thuột & Đà Lạt</p>
              </div>
              <div>
                <span className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] block mb-1">02 / Method</span>
                <p className="text-xs font-serif text-[#fcfbf7]">Slow French Butter Roast</p>
              </div>
              <div>
                <span className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] block mb-1">03 / Standard</span>
                <p className="text-xs font-serif text-[#fcfbf7]">Tailored Brew Recipes</p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Showcase (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-[#c5a880]/30 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-4">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a880] font-medium">
                  House Signature Roasts
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#a3978f] font-light">
                  Direct Harvest
                </span>
              </div>

              {/* Curated Previews */}
              <div className="space-y-4">
                <div
                  onClick={() => onSelectTab('shop')}
                  className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-[#c5a880]/40 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=200&q=80"
                    alt="Saigon Heritage Phin Coffee Powder"
                    className="w-14 h-14 rounded-lg object-cover bg-black/40 border border-[#c5a880]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors truncate font-serif">
                      Saigon Heritage Phin Powder
                    </h4>
                    <p className="text-[11px] text-[#a3978f] font-light">70% Fine Robusta • French Butter Roast</p>
                    <span className="text-xs font-mono text-[#c5a880] mt-0.5 block">From ₹380</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('shop')}
                  className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-[#c5a880]/40 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80"
                    alt="Hanoi Egg Custard Powder"
                    className="w-14 h-14 rounded-lg object-cover bg-black/40 border border-[#c5a880]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors truncate font-serif">
                      Hà Nội Egg Custard Coffee
                    </h4>
                    <p className="text-[11px] text-[#a3978f] font-light">Golden Egg Crème • Dark Volcanic Robusta</p>
                    <span className="text-xs font-mono text-[#c5a880] mt-0.5 block">From ₹420</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('shop')}
                  className="group flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-[#c5a880]/40 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=200&q=80"
                    alt="Saigon 3-in-1 Instant Box"
                    className="w-14 h-14 rounded-lg object-cover bg-black/40 border border-[#c5a880]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors truncate font-serif">
                      Saigon 3-in-1 Instant (20 Sachets)
                    </h4>
                    <p className="text-[11px] text-[#a3978f] font-light">Real Condensed Milk & Microground Coffee</p>
                    <span className="text-xs font-mono text-[#c5a880] mt-0.5 block">₹340</span>
                  </div>
                </div>
              </div>

              {/* Ritual Guide Link */}
              <button
                onClick={() => onSelectTab('brew-studio')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] font-light tracking-[0.15em] uppercase border border-[#c5a880]/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Enter Phin Gravity Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
