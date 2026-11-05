import React, { useState } from 'react';
import { ProductItem, Currency, PackageSize, GrindOption, CartItem, SiteSettings } from '../types';
import { getProductById } from '../data/coffeeData';
import { X, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { WaitlistModal } from './WaitlistModal';

interface ProductDetailModalProps {
  isOpen?: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  item?: ProductItem | null;
  currency: Currency;
  onAddToCart?: (item: CartItem) => void;
  onOpenRecipeModal?: (item: ProductItem) => void;
  onOpenPreOrderModal?: (item: ProductItem) => void;
  siteSettings?: SiteSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product: productProp,
  item: itemProp,
}) => {
  const rawProduct = productProp || itemProp;
  const isVisible = isOpen !== undefined ? isOpen : !!rawProduct;
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  if (!isVisible || !rawProduct) return null;

  const product = getProductById(rawProduct.id) || rawProduct;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 shadow-2xl overflow-hidden my-8">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-[#a3978f] hover:text-[#c5a880] transition-colors p-2 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header Visual */}
          <div className="relative aspect-16/9 w-full bg-[#1e1511] overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140d09] via-transparent to-black/30" />

            <div className="absolute top-4 left-4">
              <span className="bg-[#140d09]/90 backdrop-blur-xs text-[#c5a880] text-[10px] font-medium tracking-[0.2em] uppercase px-3 py-1 border border-[#c5a880]/50">
                Coming soon
              </span>
            </div>

            <div className="absolute bottom-4 left-4">
              <span className="bg-[#140d09]/85 backdrop-blur-xs text-[#fcfbf7] text-[9px] font-light tracking-[0.15em] uppercase px-2.5 py-1">
                Illustrative image
              </span>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5 border-b border-[#c5a880]/20 pb-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-medium block">
                {product.category === 'flavoured-coffee' ? 'Flavoured Specialty' : 'Instant Coffee'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#fcfbf7] font-normal">
                {product.name}
              </h2>
              <p className="text-sm font-serif italic text-[#c5a880]">
                {product.vietnameseName}
              </p>
              <p className="text-xs text-[#dcd4cb] font-light leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Packaging Note */}
            <div className="p-4 bg-white/5 border border-[#c5a880]/20 text-xs text-[#a3978f] font-light italic">
              Pack sizes (2g, 5g, 10g sachets) are being evaluated and will be confirmed at launch.
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#c5a880]/20">
              <div className="text-xs text-[#c5a880] font-light tracking-wider uppercase">
                Launching Soon in India
              </div>

              <button
                type="button"
                onClick={() => setWaitlistOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Join the Waitlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        product={product}
      />
    </>
  );
};
