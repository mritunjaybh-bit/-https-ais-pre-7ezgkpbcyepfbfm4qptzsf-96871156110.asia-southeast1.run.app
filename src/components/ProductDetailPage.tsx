import React, { useState, useEffect } from 'react';
import { ProductItem, Currency, PackageSize, GrindOption, CartItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { PRODUCT_ITEMS, getProductById } from '../data/coffeeData';
import {
  ArrowLeft,
  ShoppingBag,
  Zap,
  Coffee,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Mountain,
  Layers,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Share2,
  Droplets,
  BookOpen
} from 'lucide-react';

interface ProductDetailPageProps {
  product: ProductItem;
  currency: Currency;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
  onBackToShop: () => void;
  onSelectRelatedProduct: (product: ProductItem) => void;
  onOpenBrewStudio?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  onBackToShop,
  onSelectRelatedProduct,
  onOpenBrewStudio,
}) => {
  const [selectedSize, setSelectedSize] = useState<PackageSize>(
    product.availableSizes[0]?.size || '250g Valve Pouch'
  );
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | undefined>(
    product.availableGrinds ? product.availableGrinds[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedSize(product.availableSizes[0]?.size || '250g Valve Pouch');
    setSelectedGrind(product.availableGrinds ? product.availableGrinds[0] : undefined);
    setQuantity(1);
    setAddedNotice(false);

    if (typeof document !== 'undefined') {
      document.title = `${product.name} | Cà Phê Vietnamese Artisanal Roasters`;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product.id]);

  const liveProduct = getProductById(product.id) || product;
  const isOutOfStock = (liveProduct.stockQuantity ?? 50) <= 0 || liveProduct.isOutOfStock;

  const currentSizeObj =
    liveProduct.availableSizes.find((s) => s.size === selectedSize) || liveProduct.availableSizes[0];
  const unitPrice = Math.round(liveProduct.basePriceINR * (currentSizeObj?.priceMultiplier || 1));
  const totalPrice = unitPrice * quantity;

  const recipe = liveProduct.brewRecipe;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartItem: CartItem = {
      id: `${liveProduct.id}-${selectedSize}-${selectedGrind || 'none'}-${Date.now()}`,
      productId: liveProduct.id,
      name: liveProduct.name,
      vietnameseName: liveProduct.vietnameseName,
      unitPriceINR: unitPrice,
      quantity,
      imageUrl: liveProduct.imageUrl,
      selectedSize,
      selectedGrind,
      category: liveProduct.category,
    };

    onAddToCart(cartItem);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const cartItem: CartItem = {
      id: `${liveProduct.id}-${selectedSize}-${selectedGrind || 'none'}-${Date.now()}`,
      productId: liveProduct.id,
      name: liveProduct.name,
      vietnameseName: liveProduct.vietnameseName,
      unitPriceINR: unitPrice,
      quantity,
      imageUrl: liveProduct.imageUrl,
      selectedSize,
      selectedGrind,
      category: liveProduct.category,
    };

    onBuyNow(cartItem);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const relatedProducts = PRODUCT_ITEMS.filter(
    (item) => item.id !== product.id && (item.category === product.category || item.flavorType === product.flavorType)
  ).slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-[#fcfbf7] font-sans text-[#140d09] pb-24">
      {/* Editorial Luxury Top Bar */}
      <div className="border-b border-[#c5a880]/20 bg-[#fcfbf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs">
          <button
            onClick={onBackToShop}
            className="flex items-center gap-2 text-[#6e635d] hover:text-[#140d09] font-medium tracking-wider uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Return to Catalog</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[#6e635d] hover:text-[#140d09] font-medium tracking-wider uppercase transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#c5a880]" />
                <span className="text-[#c5a880]">Link Saved</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Share Piece</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden border border-[#c5a880]/30 bg-[#f7f4ee]">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Status / Origin Badge */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.originRegion && (
                  <span className="bg-[#140d09]/90 text-[#fcfbf7] text-[9px] font-medium tracking-[0.2em] uppercase px-3 py-1 rounded border border-[#c5a880]/40">
                    {product.originRegion}
                  </span>
                )}
                {product.badge && (
                  <span className="bg-white/95 text-[#140d09] text-[9px] font-medium tracking-[0.15em] uppercase px-3 py-1 rounded border border-[#c5a880]/30">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Jump to Brew Recipe Floating Pill */}
              {recipe && (
                <a
                  href="#brew-recipe-section"
                  className="absolute bottom-4 right-4 bg-white/95 text-[#140d09] hover:bg-[#140d09] hover:text-[#c5a880] text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border border-[#c5a880] shadow-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>Brew Recipe Below ↓</span>
                </a>
              )}
            </div>

            {/* House Quality Standards */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-[#c5a880]/20 text-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-[#c5a880] mx-auto" />
                <span className="text-[10px] font-medium text-[#140d09] block uppercase tracking-wider">Direct Origin</span>
                <span className="text-[9px] text-[#8c827a] block font-light">Central Highlands</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#c5a880]/20 text-center space-y-1">
                <Coffee className="w-4 h-4 text-[#c5a880] mx-auto" />
                <span className="text-[10px] font-medium text-[#140d09] block uppercase tracking-wider">Slow Roasted</span>
                <span className="text-[9px] text-[#8c827a] block font-light">Heritage Butter Drum</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#c5a880]/20 text-center space-y-1">
                <Truck className="w-4 h-4 text-[#c5a880] mx-auto" />
                <span className="text-[10px] font-medium text-[#140d09] block uppercase tracking-wider">Fresh Seal</span>
                <span className="text-[9px] text-[#8c827a] block font-light">1-Way Degassing Valve</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Grind/Size Selection & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] uppercase font-medium tracking-[0.2em] text-[#c5a880]">
                <span>
                  {product.category === 'flavoured-coffee'
                    ? product.flavorType || 'Flavoured Specialty'
                    : product.category === 'coffee-powder'
                    ? 'Ground Phin Powder'
                    : product.category === 'instant-coffee'
                    ? 'Instant 3-in-1'
                    : product.category === 'whole-bean'
                    ? 'Whole Roasted Bean'
                    : 'Brewing Hardware'}
                </span>
                {product.roastLevel && (
                  <>
                    <span>•</span>
                    <span className="text-[#8c827a]">{product.roastLevel} Roast</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#140d09] leading-tight font-serif">
                {product.name}
              </h1>

              <p className="text-sm font-serif italic text-[#c5a880]">
                {product.vietnameseName}
              </p>

              <p className="text-xs sm:text-sm text-[#6e635d] font-light leading-relaxed pt-1">
                {product.tagline}
              </p>
            </div>

            {/* Price Display */}
            <div className="p-5 rounded-xl bg-white border border-[#c5a880]/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-light text-[#8c827a] uppercase tracking-[0.2em] block mb-1">
                  Selection ({selectedSize})
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-normal text-[#140d09] font-serif">
                    {formatPrice(totalPrice, currency)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-xs text-[#8c827a] font-light">
                      ({formatPrice(unitPrice, currency)} each)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {isOutOfStock ? (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#8c827a] bg-[#fbf9f5] border border-[#c5a880]/30 px-3 py-1 rounded-full inline-block">
                    Sold Out
                  </span>
                ) : (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#140d09] bg-[#fbf9f5] border border-[#c5a880]/40 px-3 py-1 rounded-full inline-block">
                    In Stock • Fresh Batch
                  </span>
                )}
              </div>
            </div>

            {/* Package Size Selector */}
            {product.availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-[#8c827a]">
                  <span>1. Select Size:</span>
                  <span className="text-[#140d09] font-medium">{selectedSize}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.availableSizes.map((s) => {
                    const isActive = selectedSize === s.size;
                    const calculatedSizePrice = Math.round(product.basePriceINR * s.priceMultiplier);
                    return (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSelectedSize(s.size)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#c5a880] bg-[#fbf9f5]'
                            : 'border-[#c5a880]/20 bg-white hover:border-[#c5a880]/50'
                        }`}
                      >
                        <span className="text-xs font-serif text-[#140d09] block truncate">
                          {s.size.replace(' Valve Pouch', '').replace(' Fresh Pack', '')}
                        </span>
                        <span className="text-[11px] font-mono text-[#c5a880] mt-0.5 block">
                          {formatPrice(calculatedSizePrice, currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grind Option Selector */}
            {product.availableGrinds && product.availableGrinds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-[#8c827a]">
                  <span>2. Grind Calibration:</span>
                  <span className="text-[#140d09] font-medium">{selectedGrind}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.availableGrinds.map((g) => {
                    const isActive = selectedGrind === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrind(g)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#c5a880] bg-[#fbf9f5]'
                            : 'border-[#c5a880]/20 bg-white hover:border-[#c5a880]/50'
                        }`}
                      >
                        <span className="text-xs font-serif text-[#140d09] block">{g}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity & CTA Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#c5a880]/30 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-[#6e635d] hover:text-[#140d09] disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-medium text-[#140d09]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-[#6e635d] hover:text-[#140d09] disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  id="detail-add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : addedNotice
                      ? 'bg-[#140d09] text-[#c5a880] border border-[#c5a880]'
                      : 'bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] border border-[#c5a880]/40'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 text-[#c5a880]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#c5a880]" />
                      <span>Add to Bag ({formatPrice(totalPrice, currency)})</span>
                    </>
                  )}
                </button>
              </div>

              {!isOutOfStock && (
                <button
                  type="button"
                  id="detail-buy-now-btn"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-[0.2em] bg-white hover:bg-[#fbf9f5] text-[#140d09] border border-[#c5a880] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Direct Express Checkout →</span>
                </button>
              )}
            </div>

            {/* Tasting Notes */}
            <div className="pt-4 border-t border-[#c5a880]/20 space-y-2">
              <span className="text-[10px] font-medium text-[#c5a880] uppercase tracking-[0.2em] block">
                Tasting Notes:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white border border-[#c5a880]/30 text-[#140d09] px-3 py-1 rounded-full font-light"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Brew Recipe Section (Requirement: Same recipe appears on the product detail page) */}
        {recipe && (
          <section id="brew-recipe-section" className="bg-[#fbf9f5] border border-[#c5a880]/30 rounded-2xl p-6 sm:p-10 lg:p-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#c5a880]/20 pb-6">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Artisanal Barista Guide</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#140d09] font-serif">
                  {recipe.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#6e635d] font-light mt-1">
                  Master the optimal extraction calibrated specifically for this roast profile.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white border border-[#c5a880]/40 text-[#140d09]">
                  Best For: {recipe.bestFor}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#140d09] text-[#c5a880] border border-[#c5a880]/40">
                  Temp: {recipe.waterTemp}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white border border-[#c5a880]/40 text-[#6e635d]">
                  Time: {recipe.prepTime}
                </span>
              </div>
            </div>

            {/* Ingredients & Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div className="bg-white rounded-xl p-6 border border-[#c5a880]/25 space-y-4">
                <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-2">
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-[#140d09] font-serif">
                    Ingredients & Ratios
                  </h3>
                  {recipe.servingTemp && (
                    <span className="text-[10px] text-[#c5a880] tracking-wider uppercase font-mono">
                      {recipe.servingTemp}
                    </span>
                  )}
                </div>
                <ul className="space-y-2.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-[#140d09] font-light">{ing.item}</span>
                      <span className="font-mono text-[#c5a880] font-medium">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Equipment */}
              <div className="bg-white rounded-xl p-6 border border-[#c5a880]/25 space-y-4">
                <div className="border-b border-[#c5a880]/20 pb-2">
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-[#140d09] font-serif">
                    Recommended Equipment
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.equipment.map((eq, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#fbf9f5] border border-[#c5a880]/30 text-[#140d09] px-3 py-1.5 rounded-lg font-light flex items-center gap-1.5"
                    >
                      <Coffee className="w-3 h-3 text-[#c5a880]" />
                      <span>{eq}</span>
                    </span>
                  ))}
                </div>
                {onOpenBrewStudio && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onOpenBrewStudio}
                      className="text-xs text-[#c5a880] hover:text-[#140d09] font-medium tracking-wider uppercase underline underline-offset-4 cursor-pointer"
                    >
                      Open Interactive Phin Gravity Simulator →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step by Step Method */}
            <div className="space-y-4">
              <h3 className="text-base font-medium uppercase tracking-[0.15em] text-[#140d09] font-serif">
                Brewing Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-5 rounded-xl bg-white border border-[#c5a880]/25 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif text-[#140d09] font-medium">
                        Step 0{st.stepNumber} • {st.title}
                      </span>
                      {(st.duration || (st as any).timing) && (
                        <span className="text-[10px] font-mono text-[#c5a880] tracking-wider uppercase bg-[#fbf9f5] px-2 py-0.5 rounded border border-[#c5a880]/20">
                          {st.duration || (st as any).timing}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                      {st.instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Barista Tip Callout */}
            {recipe.baristaTip && (
              <div className="p-5 rounded-xl bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 flex items-start gap-4">
                <Sparkles className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#c5a880] block">
                    Barista Secret
                  </span>
                  <p className="text-xs text-[#e5ded8] font-light leading-relaxed">
                    {recipe.baristaTip}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Detailed Story & Terroir Section */}
        <div className="bg-white rounded-2xl border border-[#c5a880]/30 p-8 sm:p-12 space-y-8">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] block mb-2">
              Heritage & Terroir
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-[#140d09] font-serif mb-4">
              About This Roast
            </h2>
            <p className="text-sm text-[#4a423e] font-light leading-relaxed max-w-3xl">
              {product.description}
            </p>
          </div>

          {/* Terroir & Origin Spec Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#c5a880]/20">
            {product.originRegion && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Origin</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {product.originRegion}
                </div>
              </div>
            )}

            {product.elevation && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Elevation</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {product.elevation}
                </div>
              </div>
            )}

            {product.process && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Processing</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {product.process}
                </div>
              </div>
            )}

            {product.shelfLife && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Peak Freshness</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {product.shelfLife}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Complementary & Related Roastery Selections */}
        {relatedProducts.length > 0 && (
          <div className="space-y-8 pt-4">
            <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-normal text-[#140d09] font-serif">
                  Complementary Creations
                </h3>
                <p className="text-xs text-[#8c827a] font-light">
                  Fresh harvests from the highland estates
                </p>
              </div>

              <button
                onClick={onBackToShop}
                className="text-xs font-medium text-[#c5a880] hover:text-[#140d09] uppercase tracking-wider transition-colors cursor-pointer"
              >
                View Full Collection →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelatedProduct(rel)}
                  className="bg-white rounded-xl border border-[#c5a880]/20 overflow-hidden hover:border-[#c5a880]/60 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-[#fbf9f5] overflow-hidden">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#140d09]/90 text-[#fcfbf7] text-[8px] uppercase tracking-[0.15em] px-2 py-0.5 rounded border border-[#c5a880]/30">
                      {rel.roastLevel || 'Artisan Roast'}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-sm font-normal text-[#140d09] group-hover:text-[#c5a880] transition-colors line-clamp-1 font-serif">
                        {rel.name}
                      </h4>
                      <p className="text-[11px] text-[#6e635d] font-light line-clamp-2 mt-1">
                        {rel.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#c5a880]/20 flex items-center justify-between">
                      <span className="text-xs font-normal text-[#140d09] font-serif">
                        {formatPrice(rel.basePriceINR, currency)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-medium text-[#c5a880] flex items-center gap-1">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
