import React, { useState, useEffect } from 'react';
import { ProductItem, Currency, PackageSize, GrindOption, CartItem, SiteSettings } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { getProductById } from '../data/coffeeData';
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  BookOpen,
  CalendarClock
} from 'lucide-react';

interface ProductDetailModalProps {
  isOpen?: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  item?: ProductItem | null;
  currency: Currency;
  onAddToCart: (item: CartItem) => void;
  onOpenRecipeModal?: (item: ProductItem) => void;
  onOpenPreOrderModal?: (item: ProductItem) => void;
  siteSettings?: SiteSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product: productProp,
  item: itemProp,
  currency,
  onAddToCart,
  onOpenRecipeModal,
  onOpenPreOrderModal,
  siteSettings,
}) => {
  const rawProduct = productProp || itemProp;
  const isVisible = isOpen !== undefined ? isOpen : !!rawProduct;

  if (!isVisible || !rawProduct) return null;

  const product = getProductById(rawProduct.id) || rawProduct;
  const isOutOfStock = (product.stockQuantity ?? 50) <= 0 || product.isOutOfStock;
  const isPreOrderActive = siteSettings?.preOrderMode || isOutOfStock;

  const [selectedSize, setSelectedSize] = useState<PackageSize>(
    product.availableSizes[0]?.size || '250g Valve Pouch'
  );
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | undefined>(
    product.availableGrinds ? product.availableGrinds[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [showRecipeInline, setShowRecipeInline] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.availableSizes[0]?.size || '250g Valve Pouch');
      setSelectedGrind(product.availableGrinds ? product.availableGrinds[0] : undefined);
      setQuantity(1);
      setAddedNotice(false);
      setShowRecipeInline(false);
      setImageError(false);
    }
  }, [product?.id]);

  const currentSizeObj =
    product.availableSizes.find((s) => s.size === selectedSize) || product.availableSizes[0];
  const unitPrice = Math.round(product.basePriceINR * (currentSizeObj?.priceMultiplier || 1));
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (isOutOfStock && !siteSettings?.preOrderMode) return;
    const cartItem: CartItem = {
      id: `${product.id}-${selectedSize}-${selectedGrind || 'none'}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      vietnameseName: product.vietnameseName,
      unitPriceINR: unitPrice,
      quantity,
      imageUrl: product.imageUrl,
      selectedSize,
      selectedGrind,
      category: product.category,
    };

    onAddToCart(cartItem);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 1000);
  };

  const recipe = product.brewRecipe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto font-sans">
      <div
        className="bg-[#fcfbf7] border border-[#c5a880]/40 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-[#140d09] text-[#fcfbf7] p-5 sm:p-6 flex items-center justify-between border-b border-[#c5a880]/30">
          <div>
            <span className="text-[9px] uppercase font-medium tracking-[0.25em] text-[#c5a880] block mb-1">
              {product.category === 'flavoured-coffee'
                ? `Specialty Flavour • ${product.flavorType || 'Botanical'}`
                : product.category === 'coffee-powder'
                ? 'Ground Phin Powder'
                : product.category === 'instant-coffee'
                ? 'Instant 3-in-1 Box'
                : product.category === 'whole-bean'
                ? 'Wood-Roasted Whole Bean'
                : 'Brewing Hardware'}
            </span>
            <h2 className="text-xl sm:text-2xl font-normal font-serif text-[#fcfbf7]">{product.name}</h2>
            <p className="text-xs text-[#c5a880] font-serif italic mt-0.5">{product.vietnameseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#e5ded8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#140d09]">
          {/* Top Visual & Quick Info Banner */}
          <div className="flex flex-col sm:flex-row gap-5 bg-white p-4 rounded-xl border border-[#c5a880]/25">
            {!imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full sm:w-36 h-36 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-full sm:w-36 h-36 bg-[#140d09] rounded-lg shrink-0 flex flex-col items-center justify-center p-3 text-center border border-[#c5a880]/30">
                <span className="font-serif text-xl text-[#c5a880] font-light">CP</span>
                <span className="text-[8px] uppercase tracking-widest text-[#c5a880] mt-1">Cà Phê</span>
              </div>
            )}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {product.originRegion && (
                  <span className="bg-[#140d09] text-[#fcfbf7] text-[9px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded">
                    {product.originRegion}
                  </span>
                )}
                {product.roastLevel && (
                  <span className="text-[#6e635d] text-[10px] font-light tracking-wider uppercase border border-[#c5a880]/30 px-2 py-0.5 rounded">
                    {product.roastLevel} Roast
                  </span>
                )}
                {recipe && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenRecipeModal) {
                        onClose();
                        onOpenRecipeModal(product);
                      } else {
                        setShowRecipeInline(!showRecipeInline);
                      }
                    }}
                    className="text-[10px] font-medium tracking-wider uppercase text-[#c5a880] hover:text-[#140d09] border border-[#c5a880] px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-[#c5a880]" />
                    <span>☕ Brew Recipe</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-[#6e635d] font-light leading-relaxed">{product.description}</p>

              {/* Tasting Notes */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-[#fcfbf7] border border-[#c5a880]/20 text-[#6e635d] px-2.5 py-0.5 rounded font-light"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inline Recipe Accordion / Preview if toggled */}
          {recipe && showRecipeInline && (
            <div className="bg-[#fbf9f5] border border-[#c5a880]/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#c5a880]/20 pb-2">
                <h4 className="text-sm font-serif font-medium text-[#140d09]">{recipe.name}</h4>
                <span className="text-[10px] uppercase tracking-wider text-[#c5a880] font-mono">{recipe.waterTemp} • {recipe.prepTime}</span>
              </div>
              <p className="text-xs text-[#6e635d] font-light">
                <strong>Ingredients:</strong> {recipe.ingredients.map(i => `${i.item} (${i.quantity})`).join(', ')}
              </p>
              <div className="text-xs text-[#140d09] font-light space-y-1">
                {recipe.steps.slice(0, 3).map(s => (
                  <div key={s.stepNumber}><strong>{s.stepNumber}. {s.title}:</strong> {s.instruction}</div>
                ))}
              </div>
              {recipe.baristaTip && (
                <div className="text-[11px] text-[#c5a880] bg-[#140d09] p-2.5 rounded-lg font-light">
                  <strong>Barista tip:</strong> {recipe.baristaTip}
                </div>
              )}
            </div>
          )}

          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-[0.15em] text-[#8c827a] block">
              1. Choose Size / Format:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {product.availableSizes.map((s) => {
                const isSelected = selectedSize === s.size;
                const sizePrice = Math.round(product.basePriceINR * s.priceMultiplier);
                return (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#140d09] text-[#fcfbf7] border-[#c5a880]'
                        : 'bg-white text-[#140d09] border-[#c5a880]/25 hover:border-[#c5a880]/50'
                    }`}
                  >
                    <p className="text-xs font-serif">{s.size}</p>
                    <p className={`text-xs mt-0.5 font-mono ${isSelected ? 'text-[#c5a880]' : 'text-[#8c827a]'}`}>
                      {formatPrice(sizePrice, currency)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grind Customization (if applicable) */}
          {product.availableGrinds && product.availableGrinds.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.15em] text-[#8c827a] block">
                2. Select Grind Profile:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.availableGrinds.map((grind) => {
                  const isSelected = selectedGrind === grind;
                  return (
                    <button
                      key={grind}
                      type="button"
                      onClick={() => setSelectedGrind(grind)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#140d09] text-[#fcfbf7] border-[#c5a880]'
                          : 'bg-white text-[#6e635d] border-[#c5a880]/25 hover:border-[#c5a880]/50'
                      }`}
                    >
                      <span className="font-serif">{grind}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c5a880]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Quantity and Add Button */}
        <div className="bg-[#fbf9f5] p-5 border-t border-[#c5a880]/30 flex flex-wrap items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-white border border-[#c5a880]/30 rounded-xl p-1 px-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-7 h-7 rounded flex items-center justify-center text-[#6e635d] hover:text-[#140d09] disabled:opacity-30 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-sm font-medium w-6 text-center text-[#140d09]">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              disabled={isOutOfStock}
              className="w-7 h-7 rounded flex items-center justify-center text-[#6e635d] hover:text-[#140d09] disabled:opacity-30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price & Submit Action */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="text-right">
              <span className="text-[9px] text-[#8c827a] uppercase tracking-wider block font-light">Total</span>
              <span className="text-xl font-normal text-[#140d09] font-serif">
                {formatPrice(totalPrice, currency)}
              </span>
            </div>

            {isPreOrderActive ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPreOrderModal?.(product);
                }}
                className="px-6 py-3 rounded-xl font-medium text-xs uppercase tracking-wider bg-[#140d09] text-[#c5a880] hover:bg-[#2b1f1a] border border-[#c5a880] flex items-center gap-2 cursor-pointer"
              >
                <CalendarClock className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>Pre-Order</span>
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`px-6 py-3 rounded-xl font-medium text-xs uppercase tracking-[0.15em] flex items-center gap-2 transition-all cursor-pointer ${
                  addedNotice
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
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
