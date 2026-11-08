import React from 'react';
import { Award, Gift, Users, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface CirclePageProps {
  onBackToShop: () => void;
  onOpenTerms: () => void;
  onOpenWaitlist?: () => void;
}

export const CirclePage: React.FC<CirclePageProps> = ({ onBackToShop, onOpenTerms, onOpenWaitlist }) => {
  return (
    <div className="w-full min-h-screen bg-[#fcfbf7] text-[#140d09] font-sans pb-24">
      {/* Editorial Luxury Header Banner */}
      <section className="w-full bg-[#140d09] text-[#fcfbf7] border-b border-[#c5a880]/30 py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a170e]/80 via-[#140d09] to-[#0c0806]" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-[#c5a880] text-[10px] font-medium tracking-[0.3em] uppercase border border-[#c5a880]/40 px-3 py-1 rounded-full mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opens at launch</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal font-serif text-[#fcfbf7] tracking-tight">
            The Cà Phê Circle
          </h1>
          <p className="text-sm sm:text-base text-[#a3978f] font-light leading-relaxed max-w-xl mx-auto">
            Our patron society. Opens at launch. Earn Beans on purchases, enjoy tier multipliers, and redeem points toward your coffee orders.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBackToShop}
              className="text-xs uppercase tracking-[0.2em] text-[#c5a880] hover:text-[#fcfbf7] transition-colors cursor-pointer"
            >
              ← Back to Collection
            </button>
            <span className="text-[#504442]">•</span>
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-xs uppercase tracking-[0.2em] text-[#a3978f] hover:text-[#c5a880] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* LAUNCH NOTICE CARD (Sign-up form hidden until launch) */}
        <div className="max-w-xl mx-auto p-8 sm:p-10 rounded-2xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/50 text-[#c5a880] flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold block">
              Enrollment Opens at Launch
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-white">
              Cà Phê Circle Membership
            </h2>
            <div className="w-12 h-px bg-[#c5a880]/40 mx-auto my-3" />
            <p className="text-xs text-[#a3978f] leading-relaxed max-w-md mx-auto">
              Our patron society and member rewards program will open simultaneously with our official commercial launch. Patrons registered on our waitlist will be invited first and credited with welcome allocations.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenWaitlist && (
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#c5a880] hover:bg-[#b89a70] text-[#140d09] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Join Waitlist for Early Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onBackToShop}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        </div>

        {/* Tiers & Privileges Breakdown */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#c5a880] block">
              Planned Patron Tiers
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09]">
              Patron Tiers &amp; Privileges
            </h2>
            <div className="w-12 h-px bg-[#c5a880]/60 mx-auto" />
            <p className="text-xs text-[#6e635d]">
              Tier status will be calculated based on rolling 12-month delivered orders once live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Origin */}
            <div className="p-6 rounded-2xl bg-white border border-[#c5a880]/30 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#8c827a] font-bold">Tier 01</span>
                <h3 className="text-xl font-serif text-[#140d09]">Origin</h3>
                <div className="text-xs text-[#c5a880] font-semibold">Base Tier</div>
              </div>
              <ul className="text-xs text-[#504442] space-y-2 pt-2 border-t border-[#f4ede4]">
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a880]">•</span>
                  <span>1 Bean earned per ₹10 spent on delivered orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a880]">•</span>
                  <span>Access to standard releases</span>
                </li>
              </ul>
            </div>

            {/* Heritage */}
            <div className="p-6 rounded-2xl bg-[#140d09] text-white border border-[#c5a880] shadow-lg space-y-4 relative">
              <div className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider text-[#140d09] bg-[#c5a880] px-2 py-0.5 rounded-full">
                Popular
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#c5a880] font-bold">Tier 02</span>
                <h3 className="text-xl font-serif text-white">Heritage</h3>
                <div className="text-xs text-[#c5a880] font-semibold">1.25x Multiplier</div>
              </div>
              <ul className="text-xs text-[#a3978f] space-y-2 pt-2 border-t border-white/10">
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a880]">•</span>
                  <span>1.25 Beans earned per ₹10 spent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a880]">•</span>
                  <span>Early access to product batches</span>
                </li>
              </ul>
            </div>

            {/* Reserve */}
            <div className="p-6 rounded-2xl bg-white border border-[#c5a880]/30 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#8c827a] font-bold">Tier 03</span>
                <h3 className="text-xl font-serif text-[#140d09]">Reserve</h3>
                <div className="text-xs text-[#c5a880] font-semibold">1.5x Multiplier</div>
              </div>
              <ul className="text-xs text-[#504442] space-y-2 pt-2 border-t border-[#f4ede4]">
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a880]">•</span>
                  <span>1.5 Beans earned per ₹10 spent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c5a880]">•</span>
                  <span>Priority customer support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#e8ded1]">
          <div className="p-6 rounded-2xl bg-white border border-[#e8ded1] space-y-3">
            <Gift className="w-6 h-6 text-[#c5a880]" />
            <h4 className="font-serif text-base text-[#140d09]">100 Beans = ₹10</h4>
            <p className="text-xs text-[#6e635d] leading-relaxed">
              Transparent, fair valuation. Beans may be redeemed during checkout toward eligible orders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e8ded1] space-y-3">
            <Users className="w-6 h-6 text-[#c5a880]" />
            <h4 className="font-serif text-base text-[#140d09]">Patron Referrals</h4>
            <p className="text-xs text-[#6e635d] leading-relaxed">
              Share your personal patron code with fellow coffee enthusiasts to receive reciprocal Beans upon their first delivered order.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e8ded1] space-y-3">
            <ShieldCheck className="w-6 h-6 text-[#c5a880]" />
            <h4 className="font-serif text-base text-[#140d09]">Verified Allocation</h4>
            <p className="text-xs text-[#6e635d] leading-relaxed">
              Beans are strictly awarded upon confirmed delivery to ensure fairness and prevent fraudulent cancellations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
