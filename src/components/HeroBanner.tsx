import React from 'react';
import { ActiveTab } from '../types';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

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
              <Sparkles className="w-3 h-3" />
              <span>Cà Phê • Vietnamese Coffee House</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] font-serif text-[#fcfbf7]">
                Vietnamese-origin coffee. <br />
                <span className="italic font-serif text-[#c5a880]">Launching soon.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#a3978f] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.
              </p>
            </div>

            {/* Refined Luxury Action Buttons with safe mobile side margins */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 pt-2 max-w-[280px] sm:max-w-none mx-auto lg:mx-0 px-2 sm:px-0">
              <button
                id="hero-shop-coffee-btn"
                onClick={() => onSelectTab('shop')}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-none bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>View Planned Range</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="hero-instant-matcher-btn"
                onClick={onOpenMatcher}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-none bg-transparent hover:bg-white/5 text-[#fcfbf7] border border-[#c5a880]/40 hover:border-[#c5a880] font-light text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Taste Matcher</span>
              </button>
            </div>

            {/* Credo Row */}
            <div className="pt-8 border-t border-[#c5a880]/20 grid grid-cols-3 gap-6 text-left">
              <div>
                <span className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] block mb-1">01 / Origin</span>
                <p className="text-xs font-serif text-[#fcfbf7]">Vietnam</p>
              </div>
              <div>
                <span className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] block mb-1">02 / Market</span>
                <p className="text-xs font-serif text-[#fcfbf7]">India Release</p>
              </div>
              <div>
                <span className="text-[9px] text-[#c5a880] uppercase tracking-[0.25em] block mb-1">03 / Status</span>
                <p className="text-xs font-serif text-[#fcfbf7]">Launching Soon</p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Showcase (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative bg-white/5 backdrop-blur-sm rounded-none border border-[#c5a880]/30 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-4">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a880] font-medium">
                  Planned Product Range
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#c5a880] border border-[#c5a880]/40 px-2 py-0.5">
                  Coming Soon
                </span>
              </div>

              {/* Curated Previews of Planned Products with NO prices */}
              <div className="space-y-4">
                <div
                  onClick={() => onSelectTab('shop')}
                  className="group flex items-center gap-4 p-3 border border-transparent hover:border-[#c5a880]/40 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80"
                    alt="Vietnamese 3-in-1 Instant Coffee"
                    className="w-14 h-14 object-cover bg-black/40 border border-[#c5a880]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors truncate font-serif">
                      Vietnamese 3-in-1 Instant Coffee
                    </h4>
                    <p className="text-[11px] text-[#a3978f] font-light">A convenient instant coffee format.</p>
                    <span className="text-[10px] text-[#c5a880] tracking-wider uppercase mt-1 block">Coming soon</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('shop')}
                  className="group flex items-center gap-4 p-3 border border-transparent hover:border-[#c5a880]/40 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80"
                    alt="Pure Vietnamese Instant Black Coffee"
                    className="w-14 h-14 object-cover bg-black/40 border border-[#c5a880]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors truncate font-serif">
                      Pure Vietnamese Instant Black Coffee
                    </h4>
                    <p className="text-[11px] text-[#a3978f] font-light">A straightforward coffee-led option.</p>
                    <span className="text-[10px] text-[#c5a880] tracking-wider uppercase mt-1 block">Coming soon</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('shop')}
                  className="group flex items-center gap-4 p-3 border border-transparent hover:border-[#c5a880]/40 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=200&q=80"
                    alt="Coconut Coffee"
                    className="w-14 h-14 object-cover bg-black/40 border border-[#c5a880]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-normal text-[#fcfbf7] group-hover:text-[#c5a880] transition-colors truncate font-serif">
                      Coconut Coffee
                    </h4>
                    <p className="text-[11px] text-[#a3978f] font-light">A distinctive flavour direction.</p>
                    <span className="text-[10px] text-[#c5a880] tracking-wider uppercase mt-1 block">Coming soon</span>
                  </div>
                </div>
              </div>

              {/* Tradition Link */}
              <button
                onClick={() => onSelectTab('brew-studio')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs text-[#c5a880] font-light tracking-[0.15em] uppercase border border-[#c5a880]/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Vietnamese Coffee Tradition</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
