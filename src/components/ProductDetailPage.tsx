import React, { useState, useEffect } from 'react';
import { ProductItem, Currency, SiteSettings } from '../types';
import { getProductById } from '../data/coffeeData';
import { WaitlistModal } from './WaitlistModal';
import {
  ArrowLeft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Share2,
  Check
} from 'lucide-react';

interface ProductDetailPageProps {
  product: ProductItem;
  currency: Currency;
  onAddToCart?: (item: any) => void;
  onBuyNow?: (item: any) => void;
  onBackToShop: () => void;
  onSelectRelatedProduct?: (product: ProductItem) => void;
  onOpenBrewStudio?: () => void;
  siteSettings?: SiteSettings;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBackToShop,
  siteSettings,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Cà Phê | Vietnamese-origin coffee, launching soon in India.';
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product.id]);

  const liveProduct = getProductById(product.id) || product;

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#140d09] selection:bg-[#c5a880]/30 selection:text-[#140d09] font-sans pb-24">
      {/* Editorial Top Navigation Strip */}
      <div className="w-full border-b border-[#c5a880]/20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBackToShop}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6e635d] hover:text-[#140d09] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Collection</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-[#8c827a] hover:text-[#140d09] transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#c5a880]" />
                <span className="text-[#c5a880]">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Product Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Presentation (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-4/3 w-full bg-[#140d09] overflow-hidden border border-[#c5a880]/30 shadow-sm">
              <img
                src={liveProduct.imageUrl}
                alt={liveProduct.name}
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="bg-[#140d09]/90 backdrop-blur-xs text-[#c5a880] text-[10px] font-medium tracking-[0.2em] uppercase px-3 py-1.5 border border-[#c5a880]/50">
                  Coming soon
                </span>
              </div>

              {/* Illustrative Image Badge */}
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <span className="bg-[#140d09]/85 backdrop-blur-xs text-[#fcfbf7] text-[9px] font-light tracking-[0.15em] uppercase px-2.5 py-1">
                  Illustrative image
                </span>
              </div>
            </div>

            {/* Packaging Evaluation Note */}
            <div className="p-5 bg-white border border-[#c5a880]/20 space-y-1 text-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-medium block">
                Technical Notice
              </span>
              <p className="text-xs text-[#6e635d] font-serif italic">
                Pack sizes (2g, 5g, 10g sachets) are being evaluated and will be confirmed at launch.
              </p>
            </div>
          </div>

          {/* Right Column: Narrative, Specification & Waitlist (6 Cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-2 border-b border-[#c5a880]/20 pb-6">
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] block">
                {liveProduct.category === 'flavoured-coffee' ? 'Flavoured Variety' : 'Instant Coffee Format'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-normal text-[#140d09] font-serif">
                {liveProduct.name}
              </h1>
              <p className="text-base text-[#c5a880] font-serif italic">
                {liveProduct.vietnameseName}
              </p>
              <p className="text-sm text-[#6e635d] font-light leading-relaxed pt-2">
                {liveProduct.tagline}
              </p>
            </div>

            {/* Launch Status Notice */}
            <div className="p-4 bg-[#f8f5ee] border-l-2 border-[#c5a880] space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c827a] block">
                Release Status
              </span>
              <p className="text-xs text-[#4a3f37] font-light leading-relaxed">
                A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#8c827a] font-medium">
                About This Creation
              </h3>
              <p className="text-sm text-[#4a3f37] font-light leading-relaxed">
                {liveProduct.description}
              </p>
            </div>

            {/* Waitlist Button */}
            <div className="pt-6 border-t border-[#c5a880]/20 space-y-4">
              <button
                type="button"
                onClick={() => setWaitlistOpen(true)}
                className="w-full py-4 px-8 bg-[#140d09] hover:bg-[#2b1f1a] text-[#c5a880] hover:text-[#d8be98] text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 border border-[#c5a880]/60 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Join the Waitlist</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#c5a880]" />
              </button>
              <p className="text-[11px] text-center text-[#8c827a] font-light">
                Priority batch allocation and private notification upon launch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        product={liveProduct}
      />
    </div>
  );
};
