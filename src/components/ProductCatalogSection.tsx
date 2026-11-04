import React, { useState, useMemo, useEffect } from 'react';
import { ProductItem, ProductCategory, Currency, PackageSize, GrindOption, CartItem, SiteSettings } from '../types';
import { PRODUCT_ITEMS, fetchLiveProducts } from '../data/coffeeData';
import { HeritageDivider } from './HeritageDivider';
import {
  Sparkles,
  Clock,
  ArrowRight,
  Heart,
  Plus
} from 'lucide-react';
import { WaitlistModal } from './WaitlistModal';

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
  siteSettings,
  defaultCategory = 'all',
  initialCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory || defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState<ProductItem[]>(PRODUCT_ITEMS);
  const [waitlistModalState, setWaitlistModalState] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
  }>({
    isOpen: false,
    product: null,
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('caphe_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

  // Only show active products (the planned 5 products)
  const activeProducts = useMemo(() => {
    return productsList.filter((item) => item.isActive !== false);
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((item) => {
      if (selectedCategory === 'instant-coffee' && item.category !== 'instant-coffee') return false;
      if (selectedCategory === 'flavoured-coffee' && item.category !== 'flavoured-coffee') return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.vietnameseName.toLowerCase().includes(query) ||
          item.tagline.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  return (
    <section id="shop-catalog" className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Luxury Editorial Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#c5a880] block mb-3">
          Planned Launch Range
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#140d09] tracking-tight font-serif">
          The Planned Collection
        </h2>
        <div className="w-12 h-px bg-[#c5a880]/60 mx-auto my-4" />
        <p className="text-xs sm:text-sm text-[#6e635d] font-light leading-relaxed max-w-md mx-auto">
          A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.
        </p>
      </div>

      {/* Category Tabs: All, Instant, Flavoured */}
      <div className="mb-10 flex items-center justify-center gap-6 border-b border-[#c5a880]/20 pb-3">
        {[
          { key: 'all', label: 'All Varieties' },
          { key: 'instant-coffee', label: 'Instant Coffee' },
          { key: 'flavoured-coffee', label: 'Flavoured Varieties' },
        ].map((tab) => {
          const isSelected = selectedCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key as any)}
              className={`py-2 px-3 text-xs tracking-[0.18em] uppercase transition-all duration-300 relative cursor-pointer ${
                isSelected ? 'text-[#140d09] font-medium' : 'text-[#8c827a] hover:text-[#140d09] font-light'
              }`}
            >
              {tab.label}
              {isSelected && <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#c5a880]" />}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const isWishlisted = wishlist.includes(product.id);

          return (
            <div
              key={product.id}
              className="group bg-white rounded-none border border-[#c5a880]/30 hover:border-[#c5a880] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
            >
              {/* Product Visual Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-[#140d09]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />

                {/* Coming Soon Badge (Strict Luxury Tag) */}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#140d09]/85 backdrop-blur-xs text-[#c5a880] text-[10px] font-medium tracking-[0.2em] uppercase px-3 py-1 border border-[#c5a880]/50">
                    Coming soon
                  </span>
                </div>

                {/* Wishlist Heart */}
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    className="w-7 h-7 bg-white/90 hover:bg-white text-[#140d09] flex items-center justify-center border border-[#c5a880]/40 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#c5a880] text-[#c5a880]' : 'text-[#8c827a]'}`} />
                  </button>
                </div>

                {/* Subtle Roast Tag */}
                {product.roastLevel && (
                  <div className="absolute bottom-3 left-3 text-[9px] font-light tracking-[0.15em] uppercase text-[#fcfbf7] bg-[#140d09]/75 px-2 py-0.5 backdrop-blur-xs">
                    {product.roastLevel} Roast
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#c5a880] font-medium mb-1.5">
                    <span>
                      {product.category === 'flavoured-coffee'
                        ? product.flavorType || 'Flavoured Specialty'
                        : 'Instant Coffee Format'}
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

                  <p className="text-xs text-[#6e635d] font-light mt-2.5 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  {/* Tasting Notes */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-1">
                    {product.tastingNotes.slice(0, 3).map((note, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[#6e635d] font-light tracking-wide bg-[#fcfbf7] border border-[#c5a880]/20 px-2 py-0.5"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Strip: No Price, Only "Join the waitlist" */}
                <div className="pt-4 border-t border-[#c5a880]/20 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#8c827a] font-light">
                    In Development
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setWaitlistModalState({
                        isOpen: true,
                        product,
                      });
                    }}
                    className="px-4 py-2 bg-[#140d09] hover:bg-[#2b1f1a] text-[#c5a880] text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 border border-[#c5a880]/50 hover:border-[#c5a880] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Join the waitlist</span>
                    <ArrowRight className="w-3 h-3 text-[#c5a880]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Small Non-Product Card: "More flavours to come" */}
        <div className="bg-[#f8f5ee] border border-dashed border-[#c5a880]/60 p-8 flex flex-col justify-between space-y-6 text-center">
          <div className="space-y-3 my-auto">
            <div className="w-12 h-12 border border-[#c5a880]/60 mx-auto flex items-center justify-center text-[#c5a880]">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8c827a] block">
              Innovation & Pipeline
            </span>
            <h3 className="font-serif text-2xl font-normal text-[#140d09]">
              More flavours to come
            </h3>
            <p className="text-xs text-[#6e635d] font-light leading-relaxed max-w-xs mx-auto">
              Additional recipe variations, cold brew lattes, and botanical infusions are currently undergoing sensory evaluation.
            </p>
          </div>

          <div className="pt-4 border-t border-[#c5a880]/20">
            <button
              type="button"
              onClick={() => {
                setWaitlistModalState({
                  isOpen: true,
                  product: null,
                });
              }}
              className="w-full py-2.5 border border-[#140d09] hover:bg-[#140d09] text-[#140d09] hover:text-[#c5a880] text-xs uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer"
            >
              Join General Waitlist
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Specification Notice Under the Range */}
      <div className="mt-12 text-center py-6 px-4 bg-[#fcfbf7] border border-[#c5a880]/30 max-w-3xl mx-auto">
        <p className="text-xs sm:text-sm text-[#4a3f37] font-serif italic tracking-wide">
          &ldquo;Pack sizes (2g, 5g, 10g sachets) are being evaluated and will be confirmed at launch.&rdquo;
        </p>
      </div>

      {/* Editorial Heritage Strip */}
      <div className="mt-16 pt-10 border-t border-[#c5a880]/20 text-center">
        <p className="text-xs text-[#8c827a] uppercase tracking-[0.25em] font-light">
          A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.
        </p>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistModalState.isOpen}
        onClose={() => setWaitlistModalState({ isOpen: false, product: null })}
        product={waitlistModalState.product}
        availableProducts={activeProducts}
      />
    </section>
  );
};
