import React, { useState, useMemo } from 'react';
import { ProductItem, ProductCategory, Currency, PackageSize, GrindOption, CartItem } from '../types';
import { PRODUCT_ITEMS } from '../data/coffeeData';
import { formatPrice } from '../utils/formatCurrency';
import { HeritageDivider } from './HeritageDivider';
import {
  Plus,
  Sliders,
  Zap,
  Leaf,
  Sparkles,
  Coffee,
  Search,
  Check,
  Package,
  Layers,
  Flame,
  Award,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ProductCatalogSectionProps {
  currency: Currency;
  onOpenProductModal: (item: ProductItem) => void;
  onAddToCart?: (item: CartItem) => void;
  onQuickAddToCart?: (item: ProductItem, size: PackageSize, grind?: GrindOption) => void;
  defaultCategory?: ProductCategory;
  initialCategory?: ProductCategory;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  currency,
  onOpenProductModal,
  onAddToCart,
  onQuickAddToCart,
  defaultCategory = 'all',
  initialCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory || defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('all');
  const [roastFilter, setRoastFilter] = useState<'all' | 'Dark' | 'Medium' | 'French Butter Roast'>('all');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Per-card selected size state
  const [cardSizes, setCardSizes] = useState<Record<string, PackageSize>>({});
  // Per-card selected grind state
  const [cardGrinds, setCardGrinds] = useState<Record<string, GrindOption>>({});

  const categories: { key: ProductCategory; label: string; sub: string; icon: typeof Coffee; badge?: string }[] = [
    { key: 'all', label: 'All Products', sub: 'Complete Collection', icon: Coffee },
    { key: 'flavoured-coffee', label: 'Flavoured Coffees', sub: 'Egg, Chocolate, Coconut & More', icon: Sparkles, badge: 'Popular' },
    { key: 'coffee-powder', label: 'Ground Powders', sub: 'Phin & Drip Ready', icon: Layers },
    { key: 'instant-coffee', label: 'Instant & 3-in-1', sub: 'Micro-ground & Sachets', icon: Zap },
    { key: 'whole-bean', label: 'Whole Beans', sub: 'Single-Origin Beans', icon: Flame },
    { key: 'brewing-gear', label: 'Phin Kits & Gear', sub: 'Brewing Hardware', icon: Package },
  ];

  const flavorOptions = [
    { key: 'all', label: 'All Flavours' },
    { key: 'Egg Custard', label: '🍳 Egg Custard (Cà Phê Trứng)' },
    { key: 'Chocolate & Cacao', label: '🍫 Chocolate & Cacao (Socola)' },
    { key: 'Toasted Coconut', label: '🥥 Coconut Cream (Cốt Dừa)' },
    { key: 'Sea Salt Caramel', label: '🧂 Sea Salt (Cà Phê Muối)' },
    { key: 'Mekong Durian', label: '👑 King Durian (Sầu Riêng)' },
    { key: 'Spiced Cinnamon', label: '🪵 Cinnamon & Anise (Quế Hồi)' },
    { key: 'Pandan Leaf', label: '🍃 Pandan Vanilla (Lá Dứa)' },
    { key: 'Lotus Blossom', label: '🌸 Pink Lotus (Hoa Sen)' },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCT_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Flavor filter (when active)
      if (selectedFlavor !== 'all' && item.flavorType !== selectedFlavor) {
        return false;
      }
      // Search filter
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.vietnameseName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.tastingNotes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !(item.flavorType && item.flavorType.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      // Roast filter
      if (roastFilter !== 'all' && item.roastLevel !== roastFilter) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, selectedFlavor, searchQuery, roastFilter]);

  const handleSizeChange = (productId: string, size: PackageSize) => {
    setCardSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleGrindChange = (productId: string, grind: GrindOption) => {
    setCardGrinds((prev) => ({ ...prev, [productId]: grind }));
  };

  const handleCardAdd = (product: ProductItem) => {
    const chosenSize = cardSizes[product.id] || product.availableSizes[0].size;
    const chosenSizeObj = product.availableSizes.find((s) => s.size === chosenSize) || product.availableSizes[0];
    const chosenGrind =
      product.availableGrinds && product.availableGrinds.length > 0
        ? cardGrinds[product.id] || product.availableGrinds[0]
        : undefined;

    if (onQuickAddToCart) {
      onQuickAddToCart(product, chosenSize, chosenGrind);
    } else if (onAddToCart) {
      const calculatedPrice = Math.round(product.basePriceINR * (chosenSizeObj?.priceMultiplier || 1));
      onAddToCart({
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        vietnameseName: product.vietnameseName,
        unitPriceINR: calculatedPrice,
        quantity: 1,
        imageUrl: product.imageUrl,
        selectedSize: chosenSize,
        selectedGrind: chosenGrind,
        category: product.category,
      });
    }

    setAddedItemNotice(product.id);
    setTimeout(() => {
      setAddedItemNotice((prev) => (prev === product.id ? null : prev));
    }, 2000);
  };

  return (
    <section id="product-catalog-section" className="py-10 max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Editorial Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#785a00] bg-[#feca4d]/15 px-3 py-1 rounded-full border border-[#feca4d]/30 inline-block mb-3">
          Direct from Dak Lak & Da Lat • Freshly Ground & Packaged
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#271310] tracking-tight leading-tight font-serif"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Vietnamese Coffee Powders & Instant Blends
        </h2>
        <p
          className="mt-3 text-base text-[#504442] leading-relaxed"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Specialty single-origin Fine Robusta powders, cryo-freeze-dried instant jars, 3-in-1 condensed milk sachets, and heirloom Phin drip starter kits delivered fresh to your door.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-[#faf2f0] p-4 sm:p-5 rounded-2xl border border-[#d3c3c0]/40 mb-8 space-y-4 shadow-xs">
        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                id={`filter-category-${cat.key}`}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  if (cat.key !== 'flavoured-coffee' && cat.key !== 'all') {
                    setSelectedFlavor('all');
                  }
                }}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#271310] text-white border-[#271310] shadow-md'
                    : 'bg-white text-[#271310] border-[#d3c3c0]/60 hover:bg-[#f5e9e7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#feca4d]' : 'text-[#785a00]'}`} />
                  {cat.badge && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#feca4d] bg-white/15 px-1.5 py-0.5 rounded">
                      {cat.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold font-serif">{cat.label}</p>
                  <p className={`text-[10px] truncate ${isSelected ? 'text-[#feca4d]' : 'text-[#827472]'}`}>
                    {cat.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Vietnamese Specialty Flavor Quick Filters (Available when All or Flavoured is chosen) */}
        {(selectedCategory === 'all' || selectedCategory === 'flavoured-coffee') && (
          <div className="pt-2 border-t border-[#d3c3c0]/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[#827472] font-semibold text-[11px] uppercase mr-1 flex-shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#785a00]" /> Flavor:
              </span>
              {flavorOptions.map((flv) => {
                const isFlvActive = selectedFlavor === flv.key;
                return (
                  <button
                    key={flv.key}
                    type="button"
                    onClick={() => setSelectedFlavor(flv.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 transition-all ${
                      isFlvActive
                        ? 'bg-[#785a00] text-white shadow-xs font-bold'
                        : 'bg-white text-[#504442] hover:bg-[#eee3e1] border border-[#d3c3c0]'
                    }`}
                  >
                    {flv.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Input & Secondary Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#d3c3c0]/40">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Egg coffee, Chocolate cacao, Coconut, Sea salt, powders, instant..."
              className="w-full bg-white border border-[#d3c3c0] rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-[#271310] placeholder-[#827472] focus:outline-none focus:border-[#785a00]"
            />
          </div>

          {/* Roast Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[#827472] font-semibold text-[11px] uppercase mr-1">Roast:</span>
            {[
              { key: 'all', label: 'All Roasts' },
              { key: 'Dark', label: 'Dark' },
              { key: 'French Butter Roast', label: 'French Butter' },
              { key: 'Medium', label: 'Medium' },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setRoastFilter(r.key as any)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  roastFilter === r.key
                    ? 'bg-[#785a00] text-white'
                    : 'bg-white text-[#504442] hover:bg-[#eee3e1] border border-[#d3c3c0]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredProducts.map((product) => {
          const currentSizeName = cardSizes[product.id] || product.availableSizes[0].size;
          const currentSizeObj =
            product.availableSizes.find((s) => s.size === currentSizeName) ||
            product.availableSizes[0];
          const calculatedPriceINR = Math.round(product.basePriceINR * currentSizeObj.priceMultiplier);
          const currentGrind =
            cardGrinds[product.id] ||
            (product.availableGrinds ? product.availableGrinds[0] : undefined);
          const isAdded = addedItemNotice === product.id;

          return (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              className="bg-[#faf2f0] rounded-2xl border border-[#d3c3c0]/50 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Product Visual Container */}
              <div className="relative aspect-[16/11] bg-[#eee6e5] overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-[#271310]/90 backdrop-blur-xs text-[#feca4d] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#feca4d]/30 shadow-sm">
                    {product.badge}
                  </div>
                )}

                {/* Caffeine Strength Meter */}
                <div className="absolute bottom-3 left-3 bg-[#180b09]/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 border border-white/15">
                  <Zap className="w-3 h-3 text-[#feca4d] fill-[#feca4d]" />
                  <span>Energy: {product.caffeineScore}/5</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[#271310] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                  <span className="text-[#785a00]">★</span>
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-[#827472] text-[9px]">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Category & Origin */}
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#785a00] mb-1">
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
                      <span className="text-[#827472]">{product.roastLevel} Roast</span>
                    )}
                  </div>

                  {/* Title & Vietnamese Name */}
                  <h3
                    className="text-lg font-bold text-[#271310] font-serif leading-snug group-hover:text-[#785a00] transition-colors cursor-pointer"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                    onClick={() => onOpenProductModal(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[11px] font-medium text-[#785a00] italic mt-0.5">
                    {product.vietnameseName}
                  </p>

                  {/* Tagline / Excerpt */}
                  <p className="text-xs text-[#504442] mt-2 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Tasting Notes Chips */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.tastingNotes.slice(0, 3).map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white border border-[#d3c3c0]/60 text-[#504442] px-2 py-0.5 rounded-full font-medium"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Package Size Selector Pills */}
                {product.availableSizes.length > 1 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#d3c3c0]/40">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#827472]">
                      <span>Select Size:</span>
                      <span className="text-[#785a00] font-semibold">{currentSizeName}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {product.availableSizes.map((s) => {
                        const isSizeActive = currentSizeName === s.size;
                        return (
                          <button
                            key={s.size}
                            type="button"
                            onClick={() => handleSizeChange(product.id, s.size)}
                            className={`px-2 py-1.5 rounded-md text-[10px] font-bold text-center border transition-all ${
                              isSizeActive
                                ? 'bg-[#271310] text-white border-[#271310] shadow-2xs'
                                : 'bg-white text-[#504442] border-[#d3c3c0] hover:bg-[#eee3e1]'
                            }`}
                          >
                            {s.size.replace(' (Value Pack)', '').replace(' Valve Pouch', '').replace(' Fresh Pack', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grind Selector (If applicable) */}
                {product.availableGrinds && product.availableGrinds.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#827472] block">
                      Grind Preference:
                    </label>
                    <select
                      value={currentGrind}
                      onChange={(e) => handleGrindChange(product.id, e.target.value as GrindOption)}
                      className="w-full bg-white border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[#271310] focus:outline-none focus:border-[#785a00]"
                    >
                      {product.availableGrinds.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price and Add to Cart Action */}
                <div className="pt-3 border-t border-[#d3c3c0]/50 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#827472] uppercase block font-semibold">
                      Pack Price
                    </span>
                    <span className="text-lg font-bold text-[#271310] font-serif">
                      {formatPrice(calculatedPriceINR, currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenProductModal(product)}
                      className="p-2 rounded-lg border border-[#d3c3c0] text-[#504442] hover:bg-white transition-colors"
                      title="View Details & Origin Notes"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>

                    <button
                      id={`quick-add-btn-${product.id}`}
                      onClick={() => handleCardAdd(product)}
                      className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#785a00] hover:bg-[#8e6b00] text-white active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-14 bg-[#271310] text-[#f4eceb] rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center space-y-1.5">
          <ShieldCheck className="w-6 h-6 text-[#feca4d]" />
          <h4 className="font-bold text-sm text-white font-serif">Fresh Micro-Roast Guarantee</h4>
          <p className="text-[11px] text-[#ae8d87]">Small-batch roasted weekly and sealed in one-way degassing valve foil pouches.</p>
        </div>
        <div className="flex flex-col items-center space-y-1.5">
          <Sparkles className="w-6 h-6 text-[#feca4d]" />
          <h4 className="font-bold text-sm text-white font-serif">100% Pure Origin Terroirs</h4>
          <p className="text-[11px] text-[#ae8d87]">Sourced directly from Buon Ma Thuot & Da Lat with zero synthetic additives.</p>
        </div>
        <div className="flex flex-col items-center space-y-1.5">
          <Package className="w-6 h-6 text-[#feca4d]" />
          <h4 className="font-bold text-sm text-white font-serif">Express Dispatch & Tracking</h4>
          <p className="text-[11px] text-[#ae8d87]">Real-time package dispatch tracking with tamper-proof packaging.</p>
        </div>
      </div>

      <HeritageDivider variant="coffee-bean" />
    </section>
  );
};
