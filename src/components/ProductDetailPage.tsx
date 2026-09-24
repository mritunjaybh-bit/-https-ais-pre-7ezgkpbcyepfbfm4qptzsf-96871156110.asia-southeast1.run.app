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
  AlertCircle,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: ProductItem;
  currency: Currency;
  onAddToCart: (item: CartItem) => void;
  onBuyNow: (item: CartItem) => void;
  onBackToShop: () => void;
  onSelectRelatedProduct: (product: ProductItem) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  onBackToShop,
  onSelectRelatedProduct,
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

  // Sync state when product prop changes
  useEffect(() => {
    setSelectedSize(product.availableSizes[0]?.size || '250g Valve Pouch');
    setSelectedGrind(product.availableGrinds ? product.availableGrinds[0] : undefined);
    setQuantity(1);
    setAddedNotice(false);

    // Dynamic document title update
    if (typeof document !== 'undefined') {
      document.title = `${product.name} | Cà Phê Authentic Vietnamese Coffee`;
    }

    // Scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product.id]);

  // Read latest live product data (for dynamic admin price/stock edits)
  const liveProduct = getProductById(product.id) || product;
  const isOutOfStock = (liveProduct.stockQuantity ?? 50) <= 0 || liveProduct.isOutOfStock;

  const currentSizeObj =
    liveProduct.availableSizes.find((s) => s.size === selectedSize) || liveProduct.availableSizes[0];
  const unitPrice = Math.round(liveProduct.basePriceINR * (currentSizeObj?.priceMultiplier || 1));
  const totalPrice = unitPrice * quantity;

  const buildCartItem = (): CartItem => ({
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
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const item = buildCartItem();
    onAddToCart(item);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const item = buildCartItem();
    onBuyNow(item);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // 3 Complementary products from Dak Lak & Da Lat
  const relatedProducts = PRODUCT_ITEMS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#fff8f6] py-6 sm:py-10">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d3c3c0]/60 pb-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBackToShop}
              className="inline-flex items-center gap-1.5 font-bold text-[#785a00] hover:text-[#271310] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#827472]" />
            <span className="text-[#827472] font-medium capitalize">
              {product.category.replace('-', ' ')}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#827472] hidden sm:inline" />
            <span className="text-[#504442] font-semibold truncate max-w-[200px] sm:max-w-[320px] hidden sm:inline">
              {product.name}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#504442] hover:text-[#271310] bg-white hover:bg-[#faf2f0] border border-[#d3c3c0] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Share this product"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#785a00]" />
                <span>Share Product</span>
              </>
            )}
          </button>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden border border-[#d3c3c0]/80 shadow-sm bg-[#faf2f0]">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Top Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 bg-[#271310]/95 backdrop-blur-xs text-[#feca4d] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-[#feca4d]/40 shadow-sm">
                  {product.badge}
                </div>
              )}

              {/* Energy / Caffeine Score */}
              <div className="absolute bottom-4 left-4 bg-[#180b09]/85 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/20 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-[#feca4d] fill-[#feca4d]" />
                <span>Caffeine Kick: {product.caffeineScore}/5</span>
              </div>

              {/* Rating Badge */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs text-[#271310] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#785a00] fill-[#785a00]" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-[#827472] text-[11px]">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Quick Micro-Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-[#d3c3c0]/60 text-center space-y-0.5">
                <ShieldCheck className="w-4 h-4 text-[#785a00] mx-auto" />
                <span className="text-[10px] font-bold text-[#271310] block">100% Direct-Trade</span>
                <span className="text-[9px] text-[#827472] block">Highland Estates</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#d3c3c0]/60 text-center space-y-0.5">
                <Coffee className="w-4 h-4 text-[#785a00] mx-auto" />
                <span className="text-[10px] font-bold text-[#271310] block">Slow Micro-Roast</span>
                <span className="text-[9px] text-[#827472] block">Batch Roasted Weekly</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#d3c3c0]/60 text-center space-y-0.5">
                <Truck className="w-4 h-4 text-[#785a00] mx-auto" />
                <span className="text-[10px] font-bold text-[#271310] block">Express Delivery</span>
                <span className="text-[9px] text-[#827472] block">Free above ₹799</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Grind/Size Selection & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#785a00]">
                <span>
                  {product.category === 'flavoured-coffee'
                    ? `Flavoured Coffee • ${product.flavorType || 'Specialty'}`
                    : product.category === 'coffee-powder'
                    ? 'Ground Coffee Powder'
                    : product.category === 'instant-coffee'
                    ? 'Instant Coffee'
                    : product.category === 'whole-bean'
                    ? 'Whole Roasted Beans'
                    : 'Brewing Hardware'}
                </span>
                {product.roastLevel && (
                  <>
                    <span>•</span>
                    <span className="text-[#827472]">{product.roastLevel} Roast</span>
                  </>
                )}
              </div>

              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#271310] leading-tight font-serif"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {product.name}
              </h1>

              <p className="text-sm font-medium text-[#785a00] italic">
                {product.vietnameseName}
              </p>

              <p className="text-xs sm:text-sm text-[#504442] leading-relaxed pt-1">
                {product.tagline}
              </p>
            </div>

            {/* Price Display */}
            <div className="p-4 rounded-xl bg-white border border-[#d3c3c0]/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#827472] uppercase tracking-wider block">
                  Price ({selectedSize})
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#271310] font-serif">
                    {formatPrice(totalPrice, currency)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-xs text-[#827472]">
                      ({formatPrice(unitPrice, currency)} each)
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {isOutOfStock ? (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-full inline-block">
                    Out of Stock • Roasting Next Batch
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-block">
                    In Stock • Freshly Packed
                  </span>
                )}
              </div>
            </div>

            {/* Package Size Selector */}
            {product.availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#827472]">
                  <span>1. Choose Package Size:</span>
                  <span className="text-[#785a00]">{selectedSize}</span>
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
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#271310] text-white border-[#271310] shadow-sm'
                            : 'bg-white text-[#271310] border-[#d3c3c0] hover:bg-[#faf2f0]'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight truncate">{s.size}</div>
                        <div
                          className={`text-[11px] mt-0.5 font-semibold ${
                            isActive ? 'text-[#feca4d]' : 'text-[#785a00]'
                          }`}
                        >
                          {formatPrice(calculatedSizePrice, currency)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grind Option Selector */}
            {product.availableGrinds && product.availableGrinds.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#827472] block">
                  2. Select Grind Coarseness:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.availableGrinds.map((g) => {
                    const isGrindActive = selectedGrind === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGrind(g)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isGrindActive
                            ? 'bg-[#785a00] text-white border-[#785a00] font-bold shadow-2xs'
                            : 'bg-white text-[#504442] border-[#d3c3c0] hover:bg-[#faf2f0]'
                        }`}
                      >
                        <span className="truncate">{g}</span>
                        {isGrindActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#d3c3c0] bg-white rounded-xl overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2.5 text-[#504442] hover:bg-[#faf2f0] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-[#271310] min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2.5 text-[#504442] hover:bg-[#faf2f0] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Out of Stock</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="detail-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-98 ${
                      addedNotice
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#785a00] hover:bg-[#8e6b00] text-white'
                    }`}
                  >
                    {addedNotice ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart ({formatPrice(totalPrice, currency)})</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Buy Now Button or Out of Stock Notice */}
              {isOutOfStock ? (
                <div className="w-full py-2.5 px-4 rounded-xl text-xs bg-amber-50 border border-amber-200 text-amber-900 text-center font-medium">
                  🌿 This roast is currently sold out. Our master roasters in Dak Lak are preparing the next harvest batch!
                </div>
              ) : (
                <button
                  type="button"
                  id="detail-buy-now-btn"
                  onClick={handleBuyNow}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs bg-[#271310] hover:bg-[#3e2723] active:scale-98 text-[#feca4d] border border-[#feca4d]/30 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-[#feca4d]" />
                  <span>Buy Now with Instant Express Checkout →</span>
                </button>
              )}
            </div>

            {/* Tasting Notes Chips */}
            <div className="pt-3 border-t border-[#d3c3c0]/50 space-y-2">
              <span className="text-[11px] font-bold text-[#827472] uppercase tracking-wider block">
                Tasting Notes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white border border-[#d3c3c0] text-[#271310] px-3 py-1 rounded-full font-medium shadow-2xs"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Story, Origin & Brewing Guide Section */}
        <div className="bg-white rounded-2xl border border-[#d3c3c0]/80 p-6 sm:p-8 space-y-8 shadow-xs">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-[#271310] font-serif mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              About This Roast
            </h2>
            <p className="text-sm sm:text-[15px] text-[#3c302d] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Terroir & Origin Spec Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#d3c3c0]/50">
            {product.originRegion && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#785a00] font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Origin</span>
                </div>
                <div className="text-xs font-semibold text-[#271310]">
                  {product.originRegion}
                </div>
              </div>
            )}

            {product.elevation && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#785a00] font-bold uppercase tracking-wider">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>Elevation</span>
                </div>
                <div className="text-xs font-semibold text-[#271310]">
                  {product.elevation}
                </div>
              </div>
            )}

            {product.process && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#785a00] font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Processing</span>
                </div>
                <div className="text-xs font-semibold text-[#271310]">
                  {product.process}
                </div>
              </div>
            )}

            {product.shelfLife && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#785a00] font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Freshness Shelf Life</span>
                </div>
                <div className="text-xs font-semibold text-[#271310]">
                  {product.shelfLife}
                </div>
              </div>
            )}
          </div>

          {/* Masterclass Brewing Recommendation */}
          {product.brewingRecommendation && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#faf2f0] border-l-4 border-[#785a00] border-t border-r border-b border-[#d3c3c0]/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#785a00] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#785a00]" />
                <span>Barista Brewing Recommendation</span>
              </div>
              <p className="text-xs sm:text-sm text-[#3c302d] leading-relaxed">
                {product.brewingRecommendation}
              </p>
            </div>
          )}
        </div>

        {/* Complementary & Related Roastery Selections */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-xl sm:text-2xl font-bold text-[#271310] font-serif"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Explore Other Roastery Releases
                </h3>
                <p className="text-xs text-[#827472]">
                  Fresh batches direct from Dak Lak & Da Lat family estates
                </p>
              </div>

              <button
                onClick={onBackToShop}
                className="text-xs font-bold text-[#785a00] hover:text-[#271310] transition-colors cursor-pointer"
              >
                View All Coffees →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <a
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectRelatedProduct(rel);
                  }}
                  className="bg-white rounded-2xl border border-[#d3c3c0]/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/11] bg-[#faf2f0] overflow-hidden">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#271310]/90 text-[#feca4d] text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                      {rel.roastLevel || 'Artisan Roast'}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4
                        className="text-sm font-bold text-[#271310] group-hover:text-[#785a00] transition-colors line-clamp-1 font-serif"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {rel.name}
                      </h4>
                      <p className="text-[11px] text-[#504442] line-clamp-2 mt-1">
                        {rel.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#d3c3c0]/40 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#271310]">
                        {formatPrice(rel.basePriceINR, currency)}
                      </span>
                      <span className="text-[11px] font-bold text-[#785a00] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Roast →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
