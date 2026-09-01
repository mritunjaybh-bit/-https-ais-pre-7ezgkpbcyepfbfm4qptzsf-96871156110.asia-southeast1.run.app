import React, { useState, useEffect } from 'react';
import { ProductItem, Currency, PackageSize, GrindOption, CartItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import {
  X,
  Plus,
  Minus,
  Check,
  Zap,
  Coffee,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  Mountain,
  Layers,
  Award
} from 'lucide-react';

interface ProductDetailModalProps {
  isOpen?: boolean;
  onClose: () => void;
  product?: ProductItem | null;
  item?: ProductItem | null;
  currency: Currency;
  onAddToCart: (item: CartItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product: productProp,
  item: itemProp,
  currency,
  onAddToCart,
}) => {
  const currentProduct = productProp || itemProp;
  const isVisible = isOpen !== undefined ? isOpen : !!currentProduct;

  if (!isVisible || !currentProduct) return null;

  const product = currentProduct;

  const [selectedSize, setSelectedSize] = useState<PackageSize>(
    product.availableSizes[0]?.size || '250g Valve Pouch'
  );
  const [selectedGrind, setSelectedGrind] = useState<GrindOption | undefined>(
    product.availableGrinds ? product.availableGrinds[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.availableSizes[0]?.size || '250g Valve Pouch');
      setSelectedGrind(product.availableGrinds ? product.availableGrinds[0] : undefined);
      setQuantity(1);
      setAddedNotice(false);
    }
  }, [product?.id]);

  const currentSizeObj =
    product.availableSizes.find((s) => s.size === selectedSize) || product.availableSizes[0];
  const unitPrice = Math.round(product.basePriceINR * (currentSizeObj?.priceMultiplier || 1));
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
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
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-[#faf2f0] border border-[#d3c3c0] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-[#271310] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#feca4d]">
              {product.category === 'flavoured-coffee'
                ? `Flavoured Vietnamese Coffee • ${product.flavorType || 'Specialty Blend'}`
                : product.category === 'coffee-powder'
                ? 'Fresh Ground Coffee Powder'
                : product.category === 'instant-coffee'
                ? 'Instant Coffee & Sachet Box'
                : product.category === 'whole-bean'
                ? 'Specialty Roasted Whole Beans'
                : 'Brewing Hardware & Kits'}
            </span>
            <h2 className="text-xl font-bold font-serif">{product.name}</h2>
            <p className="text-xs text-[#feca4d] italic">{product.vietnameseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-[#271310]">
          {/* Top Visual & Quick Info Banner */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-[#d3c3c0]/50">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full sm:w-36 h-36 object-cover rounded-lg flex-shrink-0"
            />
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap gap-1.5">
                {product.badge && (
                  <span className="bg-[#785a00] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {product.badge}
                  </span>
                )}
                {product.roastLevel && (
                  <span className="bg-[#eee3e1] text-[#271310] text-[10px] font-bold px-2 py-0.5 rounded border border-[#d3c3c0]">
                    {product.roastLevel} Roast
                  </span>
                )}
                <span className="bg-[#feca4d]/20 text-[#785a00] text-[10px] font-bold px-2 py-0.5 rounded border border-[#feca4d]/40 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Energy {product.caffeineScore}/5
                </span>
              </div>

              <p className="text-xs text-[#504442] leading-relaxed">{product.description}</p>

              {/* Tasting Notes */}
              <div className="flex flex-wrap gap-1 pt-1">
                {product.tastingNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-[#faf2f0] border border-[#d3c3c0] text-[#504442] px-2 py-0.5 rounded-full font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Terroir & Origin Details */}
          {(product.originRegion || product.elevation || product.beanBlend) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#f4ecea] p-3 rounded-xl border border-[#d3c3c0]/40 text-xs">
              {product.originRegion && (
                <div>
                  <span className="text-[10px] text-[#827472] font-bold uppercase block">Origin Terroir</span>
                  <p className="font-semibold text-[#271310]">{product.originRegion}</p>
                </div>
              )}
              {product.beanBlend && (
                <div>
                  <span className="text-[10px] text-[#827472] font-bold uppercase block">Blend Profile</span>
                  <p className="font-semibold text-[#271310]">{product.beanBlend}</p>
                </div>
              )}
              {product.shelfLife && (
                <div>
                  <span className="text-[10px] text-[#827472] font-bold uppercase block">Freshness</span>
                  <p className="font-semibold text-[#271310]">{product.shelfLife}</p>
                </div>
              )}
            </div>
          )}

          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#785a00] block">
              1. Choose Package Size / Quantity:
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
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#271310] text-white border-[#271310] shadow-xs'
                        : 'bg-white text-[#271310] border-[#d3c3c0] hover:bg-[#f4ecea]'
                    }`}
                  >
                    <p className="text-xs font-bold">{s.size}</p>
                    <p className={`text-xs mt-1 font-serif ${isSelected ? 'text-[#feca4d]' : 'text-[#785a00]'}`}>
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
              <label className="text-xs font-bold uppercase tracking-wider text-[#785a00] block">
                2. Select Grind Profile for Your Equipment:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.availableGrinds.map((grind) => {
                  const isSelected = selectedGrind === grind;
                  return (
                    <button
                      key={grind}
                      type="button"
                      onClick={() => setSelectedGrind(grind)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#785a00] text-white border-[#785a00]'
                          : 'bg-white text-[#504442] border-[#d3c3c0] hover:bg-[#f4ecea]'
                      }`}
                    >
                      <span>{grind}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#feca4d]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brewing Recommendation */}
          {product.brewingRecommendation && (
            <div className="bg-[#fff8f6] p-3.5 rounded-xl border border-[#feca4d]/40 flex items-start gap-2.5">
              <Coffee className="w-4 h-4 text-[#785a00] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-[#785a00] uppercase tracking-wide">
                  Barista Home Brew Guide
                </h4>
                <p className="text-xs text-[#504442] mt-0.5">{product.brewingRecommendation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Quantity and Add Button */}
        <div className="bg-[#f4ecea] p-4 sm:p-5 border-t border-[#d3c3c0] flex flex-wrap items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-white border border-[#d3c3c0] rounded-xl p-1 px-2">
            <span className="text-[10px] font-bold text-[#827472] uppercase">Qty:</span>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 rounded-lg bg-[#faf2f0] hover:bg-[#eee3e1] flex items-center justify-center text-[#271310] disabled:opacity-30"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-7 h-7 rounded-lg bg-[#faf2f0] hover:bg-[#eee3e1] flex items-center justify-center text-[#271310]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price & Submit Action */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="text-right">
              <span className="text-[10px] text-[#827472] uppercase block font-semibold">Total</span>
              <span className="text-xl font-bold text-[#271310] font-serif">
                {formatPrice(totalPrice, currency)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-all shadow-md ${
                addedNotice
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#785a00] hover:bg-[#8e6b00] text-white active:scale-95'
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
