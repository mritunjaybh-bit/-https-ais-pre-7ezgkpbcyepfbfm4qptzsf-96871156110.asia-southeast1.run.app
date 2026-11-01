import React, { useState, useMemo, useEffect } from 'react';
import { ProductItem, ProductCategory, Currency, PackageSize, GrindOption, CartItem, SiteSettings } from '../types';
import { PRODUCT_ITEMS, fetchLiveProducts } from '../data/coffeeData';
import { formatPrice } from '../utils/formatCurrency';
import { HeritageDivider } from './HeritageDivider';
import {
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Package,
  Heart,
  CalendarClock
} from 'lucide-react';

interface ProductCatalogSectionProps {
  currency: Currency;
  onOpenProductModal: (item: ProductItem) => void;
  onOpenRecipeModal?: (item: ProductItem) => void;
  onAddToCart?: (item: CartItem) => void;
  onQuickAddToCart?: (item: ProductItem, size: PackageSize, grind?: GrindOption) => void;
  onOpenPreOrderModal?: (item: ProductItem) => void;
  siteSettings?: SiteSettings;
  defaultCategory?: ProductCategory;
  initialCategory?: ProductCategory;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  currency,
  onOpenProductModal,
  onOpenRecipeModal,
  onAddToCart,
  onQuickAddToCart,
  onOpenPreOrderModal,
  siteSettings,
  defaultCategory = 'all',
  initialCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory || defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('all');
  const [roastFilter, setRoastFilter] = useState<'all' | 'Dark' | 'Medium' | 'French Butter Roast'>('all');
  const [strengthFilter, setStrengthFilter] = useState<'all' | 'mild' | 'balanced' | 'bold'>('all');
  const [priceSort, setPriceSort] = useState<'default' | 'low-high' | 'high-low'>('default');
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('caphe_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [productsList, setProductsList] = useState<ProductItem[]>(PRODUCT_ITEMS);

  useEffect(() => {
    fetchLiveProducts().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProductsList(data);
      }
    });

    const handleUpdate = (e: CustomEvent<ProductItem[]>) => {
      if (Array.isArray(e.detail)) {
        setProductsList(e.detail);
      }
    };

    window.addEventListener('caphe_products_updated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('caphe_products_updated', handleUpdate as EventListener);
    };
  }, []);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('caphe_wishlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const categories: { key: ProductCategory; label: string; sub: string }[] = [
    { key: 'all', label: 'All Creations', sub: 'The Full House Collection' },
    { key: 'flavoured-coffee', label: 'Flavoured Specialty', sub: 'Egg, Cacao, Coconut & Botanical' },
    { key: 'coffee-powder', label: 'Phin Powders', sub: 'Single-Origin Micro-Grinds' },
    { key: 'instant-coffee', label: 'Instant & 3-in-1', sub: 'Micro-ground Arabica & Robusta' },
    { key: 'whole-bean', label: 'Whole Bean', sub: 'Slow Wood-Roasted Beans' },
    { key: 'brewing-gear', label: 'Brewing Hardware', sub: 'Stainless Phins & Barista Kits' },
  ];

  const flavorOptions = [
    { key: 'all', label: 'All Profiles' },
    { key: 'Egg Custard', label: 'Egg Custard (Cà Phê Trứng)' },
    { key: 'Chocolate & Cacao', label: 'Chocolate & Cacao (Socola)' },
    { key: 'Toasted Coconut', label: 'Coconut Cream (Cốt Dừa)' },
    { key: 'Sea Salt Caramel', label: 'Sea Salt (Cà Phê Muối)' },
    { key: 'Mekong Durian', label: 'King Durian (Sầu Riêng)' },
    { key: 'Spiced Cinnamon', label: 'Cinnamon & Anise (Quế Hồi)' },
    { key: 'Pandan Leaf', label: 'Pandan Vanilla (Lá Dứa)' },
    { key: 'Lotus Blossom', label: 'Pink Lotus (Hoa Sen)' },
  ];

  const filteredProducts = useMemo(() => {
    let result = productsList.filter((item) => {
      if (item.isActive === false) return false;
      if (showWishlistOnly && !wishlist.includes(item.id)) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedFlavor !== 'all' && item.flavorType !== selectedFlavor) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesVietnamese = item.vietnameseName.toLowerCase().includes(query);
        const matchesTagline = item.tagline.toLowerCase().includes(query);
        const matchesFlavor = item.flavorType ? item.flavorType.toLowerCase().includes(query) : false;
        const matchesNotes = item.tastingNotes.some((n) => n.toLowerCase().includes(query));
        if (!matchesName && !matchesVietnamese && !matchesTagline && !matchesFlavor && !matchesNotes) {
          return false;
        }
      }
      if (roastFilter !== 'all' && item.roastLevel !== roastFilter) {
        return false;
      }
      if (strengthFilter === 'mild' && (item.caffeineScore || 3) > 2) return false;
      if (strengthFilter === 'balanced' && (item.caffeineScore || 3) !== 3) return false;
      if (strengthFilter === 'bold' && (item.caffeineScore || 3) < 4) return false;
      return true;
    });

    if (priceSort === 'low-high') {
      result = [...result].sort((a, b) => a.basePriceINR - b.basePriceINR);
    } else if (priceSort === 'high-low') {
      result = [...result].sort((a, b) => b.basePriceINR - a.basePriceINR);
    }

    return result;
  }, [
    productsList,
    selectedCategory,
    selectedFlavor,
    searchQuery,
    roastFilter,
    strengthFilter,
    priceSort,
    showWishlistOnly,
    wishlist,
  ]);

  return (
    <section id="shop-catalog" className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Luxury Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#c5a880] block mb-3">
          Artisanal Vietnamese Roastery
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#140d09] tracking-tight font-serif">
          The Roastery Collection
        </h2>
        <div className="w-12 h-px bg-[#c5a880]/60 mx-auto my-4" />
        <p className="text-xs sm:text-sm text-[#6e635d] font-light leading-relaxed max-w-md mx-auto">
          Single-origin terroirs from Buôn Ma Thuột and Đà Lạt. Slow-roasted in the Vietnamese heritage tradition.
        </p>

        {siteSettings?.preOrderMode && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#140d09] text-[#c5a880] border border-[#c5a880]/40 text-xs">
            <CalendarClock className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>Pre-Order Mode Active • Harvest Reservations Open</span>
          </div>
        )}
      </div>

      {/* Category Navigation Bar - Minimalist Hairline Style */}
      <div className="mb-10">
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar pb-3 border-b border-[#c5a880]/20">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  if (cat.key !== 'flavoured-coffee') setSelectedFlavor('all');
                }}
                className={`py-2 px-3 text-xs sm:text-sm tracking-[0.15em] uppercase whitespace-nowrap transition-all duration-300 relative cursor-pointer ${
                  isSelected
                    ? 'text-[#140d09] font-medium'
                    : 'text-[#8c827a] hover:text-[#140d09] font-light'
                }`}
              >
                {cat.label}
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#c5a880]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Flavored Filter Pills if Flavored Category Selected */}
        {selectedCategory === 'flavoured-coffee' && (
          <div className="pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] font-medium shrink-0 mr-1">
              Profile:
            </span>
            {flavorOptions.map((flv) => (
              <button
                key={flv.key}
                onClick={() => setSelectedFlavor(flv.key)}
                className={`px-3 py-1 text-[11px] tracking-wider rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                  selectedFlavor === flv.key
                    ? 'border-[#c5a880] bg-[#140d09] text-[#fcfbf7]'
                    : 'border-[#c5a880]/30 text-[#6e635d] hover:border-[#c5a880]/60 bg-transparent'
                }`}
              >
                {flv.label}
              </button>
            ))}
          </div>
        )}

        {/* Refined Search, Roast, Strength & Wishlist Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-4 mt-2">
          {/* Subtle Minimal Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c827a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by profile, bean origin, notes..."
              className="w-full bg-[#fbf9f5] border border-[#c5a880]/30 rounded-full pl-9 pr-4 py-2 text-xs font-light text-[#140d09] placeholder-[#8c827a] focus:outline-none focus:border-[#c5a880] transition-colors"
            />
          </div>

          {/* Quick Filter Group: Strength, Sort, Wishlist */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Strength Selector */}
            <select
              aria-label="Filter products by caffeine intensity"
              value={strengthFilter}
              onChange={(e) => setStrengthFilter(e.target.value as any)}
              className="bg-[#fbf9f5] border border-[#c5a880]/30 rounded-full px-3 py-1.5 text-[11px] text-[#140d09] focus:outline-none focus:border-[#c5a880] cursor-pointer"
            >
              <option value="all">All Strengths</option>
              <option value="mild">Mild (Level 1-2)</option>
              <option value="balanced">Balanced (Level 3)</option>
              <option value="bold">Bold & Intense (Level 4-5)</option>
            </select>

            {/* Price Sorter */}
            <select
              aria-label="Sort products by price or default order"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="bg-[#fbf9f5] border border-[#c5a880]/30 rounded-full px-3 py-1.5 text-[11px] text-[#140d09] focus:outline-none focus:border-[#c5a880] cursor-pointer"
            >
              <option value="default">Curated Order</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>

            {/* Wishlist Toggle Button */}
            <button
              type="button"
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] tracking-wider uppercase transition-all cursor-pointer border ${
                showWishlistOnly
                  ? 'bg-[#140d09] text-[#fcfbf7] border-[#c5a880]'
                  : 'bg-transparent text-[#6e635d] border-[#c5a880]/30 hover:border-[#c5a880]'
              }`}
            >
              <Heart className={`w-3 h-3 ${wishlist.length > 0 ? 'fill-[#c5a880] text-[#c5a880]' : ''}`} />
              <span>Wishlist ({wishlist.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid - Editorial Luxury Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {filteredProducts.map((product) => {
          const isOutOfStock = (product.stockQuantity ?? 50) <= 0 || product.isOutOfStock;
          const isPreOrderActive = siteSettings?.preOrderMode || isOutOfStock;
          const isWishlisted = wishlist.includes(product.id);
          const hasImageError = imageErrors[product.id];

          return (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              className="group flex flex-col justify-between bg-white border border-[#c5a880]/25 rounded-xl overflow-hidden hover:border-[#c5a880]/60 transition-all duration-500 hover:shadow-xs"
            >
              {/* Product Visual Container */}
              <div className="relative aspect-[4/3] bg-[#f7f4ee] overflow-hidden">
                <a
                  href={`/product/${product.id}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.button === 1) return;
                    e.preventDefault();
                    onOpenProductModal(product);
                  }}
                  className="block w-full h-full cursor-pointer"
                >
                  {!hasImageError ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                      className={`w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out ${
                        isOutOfStock ? 'grayscale-[30%] opacity-90' : ''
                      }`}
                    />
                  ) : (
                    /* Elegant Luxury Monogram Fallback if image fails to load */
                    <div className="w-full h-full bg-[#140d09] flex flex-col items-center justify-center p-6 text-center border-b border-[#c5a880]/30">
                      <div className="w-16 h-16 rounded-full border border-[#c5a880]/40 flex items-center justify-center mb-3">
                        <span className="font-serif text-2xl text-[#c5a880] tracking-widest font-light">CP</span>
                      </div>
                      <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-medium block">
                        Cà Phê Vietnam
                      </span>
                      <span className="text-[10px] text-[#8c827a] font-serif italic mt-1">
                        {product.vietnameseName}
                      </span>
                    </div>
                  )}
                </a>

                {/* Top Status Indicators */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                  {isPreOrderActive ? (
                    <span className="bg-[#140d09]/90 text-[#c5a880] text-[9px] font-medium tracking-[0.2em] uppercase px-2.5 py-1 rounded border border-[#c5a880]/40 backdrop-blur-xs">
                      {isOutOfStock ? 'Pre-Order / Waitlist' : 'Pre-Order Open'}
                    </span>
                  ) : product.originRegion ? (
                    <span className="bg-white/90 backdrop-blur-xs text-[#140d09] text-[9px] font-medium tracking-[0.15em] uppercase px-2.5 py-1 rounded border border-[#c5a880]/30">
                      {product.originRegion}
                    </span>
                  ) : null}
                </div>

                {/* Top Right Controls: Wishlist Heart + Recipe Tag */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-[#140d09] flex items-center justify-center border border-[#c5a880]/50 shadow-xs transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#c5a880] text-[#c5a880]' : 'text-[#8c827a]'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenRecipeModal?.(product);
                    }}
                    title={`View brew recipe for ${product.name}`}
                    className="bg-white/95 hover:bg-[#140d09] text-[#140d09] hover:text-[#c5a880] text-[10px] font-medium tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border border-[#c5a880] shadow-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                  >
                    <span>☕ Recipe</span>
                  </button>
                </div>

                {/* Subtle Roast Tag */}
                {product.roastLevel && (
                  <div className="absolute bottom-3 left-3 text-[9px] font-light tracking-[0.15em] uppercase text-[#fcfbf7] bg-[#140d09]/70 px-2 py-0.5 rounded backdrop-blur-xs">
                    {product.roastLevel} Roast
                  </div>
                )}
              </div>

              {/* Card Body - Minimal Refined Editorial Layout */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#c5a880] font-medium mb-1">
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
                    <span className="text-[#8c827a] font-normal">
                      ★ {product.rating.toFixed(1)}
                    </span>
                  </div>

                  <a
                    href={`/product/${product.id}`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.button === 1) return;
                      e.preventDefault();
                      onOpenProductModal(product);
                    }}
                    className="block group/link"
                  >
                    <h3 className="text-lg sm:text-xl font-normal text-[#140d09] font-serif leading-snug group-hover/link:text-[#c5a880] transition-colors">
                      {product.name}
                    </h3>
                  </a>

                  <p className="text-[11px] font-serif italic text-[#c5a880] mt-0.5">
                    {product.vietnameseName}
                  </p>

                  <p className="text-xs text-[#6e635d] font-light mt-2 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Tasting Notes */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-1">
                    {product.tastingNotes.slice(0, 3).map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[#6e635d] font-light tracking-wide bg-[#fcfbf7] border border-[#c5a880]/20 px-2 py-0.5 rounded"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price and Dedicated Action */}
                <div className="pt-4 border-t border-[#c5a880]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#8c827a] uppercase tracking-[0.15em] block font-light">
                      From
                    </span>
                    <span className="text-base sm:text-lg font-normal text-[#140d09] font-serif">
                      {formatPrice(product.basePriceINR, currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPreOrderActive ? (
                      <button
                        type="button"
                        onClick={() => onOpenPreOrderModal?.(product)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-[#140d09] text-[#c5a880] hover:bg-[#2b1f1a] transition-all flex items-center gap-1 cursor-pointer border border-[#c5a880]/50"
                      >
                        <CalendarClock className="w-3 h-3 text-[#c5a880]" />
                        <span>Pre-Order</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenProductModal(product)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase bg-[#140d09] text-[#fcfbf7] hover:bg-[#2b1f1a] transition-all flex items-center gap-1 cursor-pointer border border-[#c5a880]/40"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3 text-[#c5a880]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* House Credo & Standards Section */}
      <div className="mt-20 border-t border-b border-[#c5a880]/30 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-1.5 px-4">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a880] block">01 / Provenance</span>
          <h4 className="font-normal text-base text-[#140d09] font-serif">Direct Terroir Sourcing</h4>
          <p className="text-xs text-[#6e635d] font-light leading-relaxed">
            Cultivated in the basalt volcanic soils of Buôn Ma Thuột and the misty plateaus of Đà Lạt.
          </p>
        </div>
        <div className="space-y-1.5 px-4 md:border-x md:border-[#c5a880]/20">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a880] block">02 / Artistry</span>
          <h4 className="font-normal text-base text-[#140d09] font-serif">Slow Micro-Batch Roasting</h4>
          <p className="text-xs text-[#6e635d] font-light leading-relaxed">
            Traditional French butter slow roasting to coax notes of dark cocoa and honeyed malt.
          </p>
        </div>
        <div className="space-y-1.5 px-4">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#c5a880] block">03 / Purity</span>
          <h4 className="font-normal text-base text-[#140d09] font-serif">Single-Way Degassing Seal</h4>
          <p className="text-xs text-[#6e635d] font-light leading-relaxed">
            Sealed immediately upon roasting in valve foil pouches for pristine aromatic preservation.
          </p>
        </div>
      </div>

      <HeritageDivider variant="coffee-bean" />
    </section>
  );
};
