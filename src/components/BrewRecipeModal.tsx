import React, { useEffect } from 'react';
import { ProductItem, CartItem, Currency } from '../types.ts';
import { formatPrice } from '../utils/formatCurrency.ts';
import { X, Clock, Thermometer, Droplet, Coffee, Sparkles, Check, ChevronRight } from 'lucide-react';

interface BrewRecipeModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onAddToCart?: (item: CartItem) => void;
  onOpenBrewStudio?: () => void;
}

export const BrewRecipeModal: React.FC<BrewRecipeModalProps> = ({
  product,
  isOpen,
  onClose,
  currency,
  onAddToCart,
  onOpenBrewStudio,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product || !product.brewRecipe) {
    return null;
  }

  const recipe = product.brewRecipe;

  const handleQuickAdd = () => {
    if (!onAddToCart) return;
    const defaultSize = product.availableSizes[0]?.size || '250g Valve Pouch';
    const multiplier = product.availableSizes[0]?.priceMultiplier || 1.0;
    const unitPrice = Math.round(product.basePriceINR * multiplier);

    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      vietnameseName: product.vietnameseName,
      unitPriceINR: unitPrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      selectedSize: defaultSize,
      selectedGrind: product.availableGrinds ? product.availableGrinds[0] : undefined,
      category: product.category,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#fcfbf7] border border-[#c5a880]/30 rounded-2xl shadow-2xl text-[#1a120b] flex flex-col"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Sticky Header with Luxury Close */}
        <div className="sticky top-0 z-10 bg-[#fcfbf7]/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-[#c5a880]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#8c6d3f] font-medium">
              Official Roastery Method
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close recipe"
            className="w-8 h-8 rounded-full border border-[#c5a880]/30 flex items-center justify-center text-[#5c4a3b] hover:text-[#1a120b] hover:border-[#1a120b] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-6 space-y-7">
          {/* Title Lockup */}
          <div className="border-b border-[#c5a880]/20 pb-5">
            <span className="text-xs text-[#8c6d3f] italic font-serif">
              {product.vietnameseName}
            </span>
            <h3
              id="recipe-modal-title"
              className="text-2xl sm:text-3xl font-serif text-[#140d09] tracking-tight leading-snug mt-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {recipe.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#5c4a3b] mt-1 font-light tracking-wide">
              Crafted specifically for <span className="font-medium text-[#140d09]">{product.name}</span>
            </p>
          </div>

          {/* Key Metric Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#f7f4ee] border border-[#c5a880]/20 rounded-xl">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#8c6d3f] block font-medium">
                Best For
              </span>
              <span className="text-xs font-serif text-[#140d09] mt-1 block font-medium leading-tight">
                {recipe.bestFor}
              </span>
            </div>

            <div className="p-3.5 bg-[#f7f4ee] border border-[#c5a880]/20 rounded-xl">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#8c6d3f] block font-medium">
                Water Temp
              </span>
              <span className="text-xs font-serif text-[#140d09] mt-1 block font-medium leading-tight">
                {recipe.waterTemp}
              </span>
            </div>

            <div className="p-3.5 bg-[#f7f4ee] border border-[#c5a880]/20 rounded-xl">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#8c6d3f] block font-medium">
                Ritual Duration
              </span>
              <span className="text-xs font-serif text-[#140d09] mt-1 block font-medium leading-tight">
                {recipe.prepTime}
              </span>
            </div>

            <div className="p-3.5 bg-[#f7f4ee] border border-[#c5a880]/20 rounded-xl">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#8c6d3f] block font-medium">
                Serving Style
              </span>
              <span className="text-xs font-serif text-[#140d09] mt-1 block font-medium leading-tight">
                {recipe.servingTemp}
              </span>
            </div>
          </div>

          {/* Equipment & Ingredients Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Equipment */}
            <div className="space-y-3">
              <h4 className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8c6d3f] flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5" />
                <span>Required Equipment</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#3a2d24]">
                {recipe.equipment.map((eq, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#8c6d3f] text-xs leading-none mt-0.5">•</span>
                    <span>{eq}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <h4 className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8c6d3f] flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5" />
                <span>Exact Proportions</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#3a2d24]">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-baseline justify-between border-b border-[#c5a880]/15 pb-1 gap-2">
                    <span className="font-medium text-[#140d09]">{ing.item}</span>
                    <span className="text-[#8c6d3f] font-mono text-[11px] shrink-0">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Method */}
          <div className="space-y-4 pt-2">
            <h4 className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8c6d3f]">
              Step-by-Step Brewing Method
            </h4>
            <div className="space-y-3">
              {recipe.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="p-4 bg-white border border-[#c5a880]/20 rounded-xl space-y-1.5 transition-colors hover:border-[#c5a880]/50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-[#140d09] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#140d09] text-[#fcfbf7] text-[10px] font-sans flex items-center justify-center">
                        {st.stepNumber}
                      </span>
                      <span>{st.title}</span>
                    </span>
                    {st.duration && (
                      <span className="text-[11px] font-mono text-[#8c6d3f] bg-[#f7f4ee] px-2 py-0.5 rounded border border-[#c5a880]/20">
                        {st.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#4a3b30] leading-relaxed pl-7 font-light">
                    {st.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Barista Secret Tip Callout */}
          <div className="p-4 bg-[#f7f4ee] border border-[#c5a880]/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#8c6d3f] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Roastery Master Tip</span>
            </div>
            <p className="text-xs text-[#3a2d24] leading-relaxed italic font-serif">
              "{recipe.baristaTip}"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#fcfbf7]/95 backdrop-blur-md px-6 sm:px-8 py-4 border-t border-[#c5a880]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onOpenBrewStudio && (
            <button
              onClick={() => {
                onClose();
                onOpenBrewStudio();
              }}
              className="w-full sm:w-auto text-xs font-semibold tracking-wider uppercase text-[#8c6d3f] hover:text-[#140d09] transition-colors py-2 px-3 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Practice in Virtual Phin Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onAddToCart && (
            <button
              onClick={handleQuickAdd}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#140d09] text-[#fcfbf7] hover:bg-[#251811] text-xs font-semibold tracking-[0.18em] uppercase rounded-lg border border-[#c5a880]/40 transition-colors cursor-pointer shadow-sm ml-auto"
            >
              Acquire Blend • {formatPrice(product.basePriceINR, currency)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
