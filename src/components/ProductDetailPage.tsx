import React, { useState, useEffect } from 'react';
import { ProductItem, Currency, PackageSize, GrindOption, CartItem, SiteSettings, ProductReview } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { PRODUCT_ITEMS, getProductById } from '../data/coffeeData';
import { ReviewModal } from './ReviewModal';
import { PreOrderModal } from './PreOrderModal';
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
  BookOpen,
  CalendarClock,
  MessageSquare,
  Award
} from 'lucide-react';

interface ProductDetailPageProps {
  product: ProductItem;
  currency: Currency;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
  onBackToShop: () => void;
  onSelectRelatedProduct: (product: ProductItem) => void;
  onOpenBrewStudio?: () => void;
  siteSettings?: SiteSettings;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  onBackToShop,
  onSelectRelatedProduct,
  onOpenBrewStudio,
  siteSettings,
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  useEffect(() => {
    setSelectedSize(product.availableSizes[0]?.size || '250g Valve Pouch');
    setSelectedGrind(product.availableGrinds ? product.availableGrinds[0] : undefined);
    setQuantity(1);
    setAddedNotice(false);
    setImageError(false);

    if (typeof document !== 'undefined') {
      document.title = `${product.name} | Cà Phê Vietnamese Artisanal Roasters`;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Fetch approved customer reviews
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews)) {
          const matching = data.reviews.filter((rv: ProductReview) => rv.productId === product.id);
          setReviews(matching);
        }
      })
      .catch(() => {});
  }, [product.id]);

  const liveProduct = getProductById(product.id) || product;
  const isOutOfStock = (liveProduct.stockQuantity ?? 50) <= 0 || liveProduct.isOutOfStock;
  const isPreOrderActive = siteSettings?.preOrderMode || isOutOfStock;

  const currentSizeObj =
    liveProduct.availableSizes.find((s) => s.size === selectedSize) || liveProduct.availableSizes[0];
  const unitPrice = Math.round(liveProduct.basePriceINR * (currentSizeObj?.priceMultiplier || 1));
  const totalPrice = unitPrice * quantity;

  const recipe = liveProduct.brewRecipe;
  const freeThreshold = siteSettings?.freeShippingThreshold || 799;
  const dispatchWindow = siteSettings?.dispatchWindow || '24 to 48 business hours';

  const handleAddToCart = () => {
    if (isOutOfStock && !siteSettings?.preOrderMode) return;
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
    if (isOutOfStock && !siteSettings?.preOrderMode) return;
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
            <ArrowLeft className="w-4 h-4 text-[#c5a880]" />
            <span>Return to Collection</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[#6e635d] hover:text-[#140d09] transition-colors cursor-pointer text-xs uppercase tracking-wider font-light"
            >
              <Share2 className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-16">
        {/* Main Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Visual Presentation (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-square bg-[#f5f1e8] rounded-2xl overflow-hidden border border-[#c5a880]/30 shadow-xs">
              {!imageError ? (
                <img
                  src={liveProduct.imageUrl}
                  alt={liveProduct.name}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover ${
                    isOutOfStock ? 'grayscale-[25%] opacity-95' : ''
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-[#140d09] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full border border-[#c5a880]/40 flex items-center justify-center mb-4">
                    <span className="font-serif text-3xl text-[#c5a880] tracking-widest font-light">CP</span>
                  </div>
                  <span className="text-sm uppercase tracking-[0.25em] text-[#c5a880] font-medium block">
                    Cà Phê Vietnam
                  </span>
                  <span className="text-xs text-[#8c827a] font-serif italic mt-1">
                    {liveProduct.vietnameseName}
                  </span>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                {isPreOrderActive ? (
                  <span className="bg-[#140d09] text-[#c5a880] text-[10px] font-medium tracking-[0.2em] uppercase px-3 py-1.5 rounded-md border border-[#c5a880]/40">
                    {isOutOfStock ? 'Waitlist Reservation' : 'Pre-Order Active'}
                  </span>
                ) : liveProduct.originRegion ? (
                  <span className="bg-white/95 backdrop-blur-xs text-[#140d09] text-[10px] font-medium tracking-[0.15em] uppercase px-3 py-1.5 rounded-md border border-[#c5a880]/30">
                    {liveProduct.originRegion}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Delivery & Returns Transparency Summary Box */}
            <div className="p-5 rounded-2xl bg-white border border-[#c5a880]/25 space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c5a880] font-medium">
                <Truck className="w-4 h-4 text-[#c5a880]" />
                <span>Delivery & Roastery Assurance</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4a423e]">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[#8c827a] block">Fresh Dispatch Window:</span>
                  <p className="font-medium text-[#140d09]">{dispatchWindow}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[#8c827a] block">Complimentary Shipping:</span>
                  <p className="font-medium text-[#140d09]">Free on orders above ₹{freeThreshold}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[#8c827a] block">Sealed Aroma Protection:</span>
                  <p className="font-medium text-[#140d09]">Triple-laminate degassing valve</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[#8c827a] block">Damaged Transit Guarantee:</span>
                  <p className="font-medium text-[#140d09]">100% replacement or refund</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Selection & Acquisition (6 Cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-2 border-b border-[#c5a880]/20 pb-6">
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] block">
                {liveProduct.category === 'flavoured-coffee'
                  ? `Specialty Flavour • ${liveProduct.flavorType || 'Botanical'}`
                  : liveProduct.category === 'coffee-powder'
                  ? 'Ground Phin Powder'
                  : liveProduct.category === 'instant-coffee'
                  ? 'Instant 3-in-1 Box'
                  : liveProduct.category === 'whole-bean'
                  ? 'Wood-Roasted Whole Bean'
                  : 'Brewing Hardware'}
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

            {/* Price Presentation */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-normal text-[#140d09] font-serif">
                {formatPrice(totalPrice, currency)}
              </span>
              <span className="text-xs text-[#8c827a] font-light">
                (Inclusive of all taxes)
              </span>
            </div>

            {/* Package Size Selector */}
            {liveProduct.availableSizes && liveProduct.availableSizes.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a880] block">
                  Package Size:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {liveProduct.availableSizes.map((sz) => (
                    <button
                      key={sz.size}
                      type="button"
                      onClick={() => setSelectedSize(sz.size)}
                      className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        selectedSize === sz.size
                          ? 'border-[#c5a880] bg-[#140d09] text-[#fcfbf7]'
                          : 'border-[#c5a880]/25 bg-white text-[#140d09] hover:border-[#c5a880]/60'
                      }`}
                    >
                      <span className="font-medium block">{sz.size}</span>
                      <span className="text-[10px] opacity-75 font-mono mt-0.5 block">
                        {formatPrice(Math.round(liveProduct.basePriceINR * sz.priceMultiplier), currency)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grind Option Selector */}
            {liveProduct.availableGrinds && liveProduct.availableGrinds.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c5a880] block">
                  Grind Calibration:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {liveProduct.availableGrinds.map((grind) => (
                    <button
                      key={grind}
                      type="button"
                      onClick={() => setSelectedGrind(grind)}
                      className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                        selectedGrind === grind
                          ? 'border-[#c5a880] bg-[#140d09] text-[#fcfbf7]'
                          : 'border-[#c5a880]/25 bg-white text-[#140d09] hover:border-[#c5a880]/60'
                      }`}
                    >
                      <span className="font-medium text-[11px]">{grind}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector and CTA Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#c5a880]/40 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-[#6e635d] hover:text-[#140d09] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-[#6e635d] hover:text-[#140d09] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isPreOrderActive ? (
                  <button
                    type="button"
                    onClick={() => setIsPreOrderModalOpen(true)}
                    className="flex-1 py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-[0.2em] bg-[#140d09] text-[#c5a880] hover:bg-[#2b1f1a] border border-[#c5a880] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CalendarClock className="w-4 h-4 text-[#c5a880]" />
                    <span>Reserve via Pre-Order</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-[0.2em] bg-[#140d09] text-[#fcfbf7] hover:bg-[#2b1f1a] border border-[#c5a880]/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {addedNotice ? (
                      <>
                        <Check className="w-4 h-4 text-[#c5a880]" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#c5a880]" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {!isOutOfStock && (
                <button
                  type="button"
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

        {/* Dedicated Brew Recipe Section */}
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

        {/* Why Cà Phê Vietnam Brand Story Section */}
        <section className="bg-white rounded-2xl border border-[#c5a880]/30 p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] block mb-2">
              The Roastery Difference
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09]">
              Why Cà Phê Vietnam?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 p-5 rounded-xl bg-[#fcfbf7] border border-[#c5a880]/20">
              <span className="w-7 h-7 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center font-mono text-xs">
                01
              </span>
              <h3 className="font-serif text-sm font-medium text-[#140d09]">Volcanic Micro-Terroirs</h3>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Directly harvested from Buôn Ma Thuột's deep red basalt plateaus and Đà Lạt's mist-covered Langbiang mountain ridges.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-xl bg-[#fcfbf7] border border-[#c5a880]/20">
              <span className="w-7 h-7 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center font-mono text-xs">
                02
              </span>
              <h3 className="font-serif text-sm font-medium text-[#140d09]">Traditional Butter Roast</h3>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                Slow French-style butter roasting coaxes rich caramelization, velvety crema, and heavy dark cocoa undertones.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-xl bg-[#fcfbf7] border border-[#c5a880]/20">
              <span className="w-7 h-7 rounded-full bg-[#140d09] text-[#c5a880] flex items-center justify-center font-mono text-xs">
                03
              </span>
              <h3 className="font-serif text-sm font-medium text-[#140d09]">Ethical Direct Trade</h3>
              <p className="text-xs text-[#6e635d] font-light leading-relaxed">
                No middle agents. We partner directly with 3rd-generation Vietnamese farming families to ensure sustainable highland forestry.
              </p>
            </div>
          </div>
        </section>

        {/* Customer Reviews & Verified Tasting Notes Section */}
        <section id="product-reviews" className="bg-[#fbf9f5] rounded-2xl border border-[#c5a880]/30 p-8 sm:p-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c5a880]/20 pb-6">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] block mb-1">
                Verified Client Opinions
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#140d09]">
                Tasting Notes & Reviews ({reviews.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#140d09] hover:bg-[#2b1f1a] text-[#fcfbf7] text-xs uppercase tracking-wider transition-colors cursor-pointer border border-[#c5a880]/40 flex items-center gap-2 self-start sm:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Write a Review</span>
            </button>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-xl bg-white border border-[#c5a880]/20 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#c5a880]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#c5a880] text-[#c5a880]' : 'text-[#d8cfca]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#8c827a]">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {rev.title && (
                    <h3 className="font-serif text-sm font-medium text-[#140d09]">
                      {rev.title}
                    </h3>
                  )}

                  <p className="text-xs text-[#52463f] font-light leading-relaxed">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 border-t border-[#c5a880]/15 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#140d09]">{rev.customerName}</span>
                    <span className="text-emerald-700 font-mono flex items-center gap-1 text-[10px]">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified Buyer ({rev.orderId})</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-white border border-[#c5a880]/20 text-center space-y-3">
              <p className="text-xs text-[#6e635d] font-light">
                No reviews published yet for this micro-lot harvest. Have you brewed this coffee?
              </p>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs text-[#c5a880] hover:text-[#140d09] underline font-medium tracking-wider uppercase cursor-pointer"
              >
                Share your tasting notes with your Order ID →
              </button>
            </div>
          )}
        </section>

        {/* Detailed Terroir Spec Grid */}
        <div className="bg-white rounded-2xl border border-[#c5a880]/30 p-8 sm:p-12 space-y-8">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#c5a880] block mb-2">
              Heritage & Terroir
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-[#140d09] font-serif mb-4">
              About This Roast
            </h2>
            <p className="text-sm text-[#4a423e] font-light leading-relaxed max-w-3xl">
              {liveProduct.description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#c5a880]/20">
            {liveProduct.originRegion && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Origin</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {liveProduct.originRegion}
                </div>
              </div>
            )}

            {liveProduct.elevation && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Elevation</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {liveProduct.elevation}
                </div>
              </div>
            )}

            {liveProduct.process && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Processing</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {liveProduct.process}
                </div>
              </div>
            )}

            {liveProduct.shelfLife && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c5a880] font-medium uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Peak Freshness</span>
                </div>
                <div className="text-xs font-serif text-[#140d09]">
                  {liveProduct.shelfLife}
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

      {/* Review Submission Modal (Requires Order ID + Email Verification) */}
      <ReviewModal
        product={liveProduct}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          setIsReviewModalOpen(false);
        }}
      />

      {/* Pre-Order / Waitlist Reservation Modal */}
      <PreOrderModal
        product={liveProduct}
        isOpen={isPreOrderModalOpen}
        onClose={() => setIsPreOrderModalOpen(false)}
        onSuccess={() => {
          setIsPreOrderModalOpen(false);
        }}
      />
    </div>
  );
};
