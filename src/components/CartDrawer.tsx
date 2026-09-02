import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { sendOrderEmails, EmailSendResult } from '../utils/emailService';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Gift,
  ArrowRight,
  Tag,
  Check,
  Package,
  Truck,
  ShieldCheck,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (orderDetails: {
    orderId?: string;
    shippingType: 'standard' | 'express' | 'same-day';
    shippingAddress: string;
    cityPincode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    giftMessage?: string;
    discountINR: number;
    finalTotalINR: number;
    emailSentSuccess?: boolean;
    emailMessage?: string;
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [cityPincode, setCityPincode] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [includeGiftWrap, setIncludeGiftWrap] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  const subtotalINR = items.reduce((sum, item) => sum + item.unitPriceINR * item.quantity, 0);
  const freeShippingThreshold = 799;
  const isFreeShipping = subtotalINR >= freeShippingThreshold;
  const shippingFeeINR = isFreeShipping
    ? shippingType === 'express'
      ? 120
      : 0
    : shippingType === 'express'
    ? 180
    : 80;

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'VIETNAM15' || code === 'XINCHAO') {
      const discount = Math.round(subtotalINR * 0.15);
      setAppliedDiscount(discount);
      setPromoSuccess('15% Coffee discount applied!');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(shippingFeeINR);
      setPromoSuccess('Free express courier applied!');
    } else {
      setPromoError('Invalid promo code.');
      setAppliedDiscount(0);
    }
  };

  const finalTotalINR = Math.max(0, subtotalINR + shippingFeeINR - appliedDiscount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !customerEmail.trim() ||
      !shippingAddress.trim() ||
      !cityPincode.trim()
    ) {
      alert('Please fill in all delivery and contact fields.');
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    const orderId = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    setIsSubmitting(true);
    setEmailStatus('sending');
    setEmailStatusMessage('Sending order confirmation emails to owner and customer...');

    try {
      const emailResult: EmailSendResult = await sendOrderEmails({
        orderId,
        items,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        cityPincode: cityPincode.trim(),
        finalTotalINR,
      });

      if (emailResult.success) {
        setEmailStatus('success');
        setEmailStatusMessage('Both emails sent successfully! Customer & owner confirmed.');
      } else {
        setEmailStatus('error');
        setEmailStatusMessage(emailResult.message || 'Email dispatch incomplete.');
      }

      // Allow brief moment for visual confirmation before opening receipt modal
      setTimeout(() => {
        setIsSubmitting(false);
        onCheckout({
          orderId,
          shippingType,
          shippingAddress: shippingAddress.trim(),
          cityPincode: cityPincode.trim(),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
          discountINR: appliedDiscount,
          finalTotalINR,
          emailSentSuccess: emailResult.success,
          emailMessage: emailResult.message,
        });
      }, 700);
    } catch (err: any) {
      console.error('EmailJS execution error:', err);
      setIsSubmitting(false);
      setEmailStatus('error');
      setEmailStatusMessage(err?.text || err?.message || 'Error executing email service.');

      // Proceed with local checkout so user order isn't lost
      onCheckout({
        orderId,
        shippingType,
        shippingAddress: shippingAddress.trim(),
        cityPincode: cityPincode.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
        discountINR: appliedDiscount,
        finalTotalINR,
        emailSentSuccess: false,
        emailMessage: 'Email delivery pending roastery connection.',
      });
    }
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-[#faf2f0] h-full shadow-2xl flex flex-col justify-between border-l border-[#d3c3c0]/50"
      >
        {/* Cart Drawer Header */}
        <div className="bg-[#271310] text-[#f4eceb] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#feca4d]" />
            <h3 className="font-serif font-bold text-base text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Coffee Cart ({items.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#d3c3c0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#f0e6e4] px-5 py-2.5 border-b border-[#d3c3c0]/40 text-xs">
          {subtotalINR >= freeShippingThreshold ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>You've unlocked FREE All-India Courier Shipping!</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#504442] font-semibold">
                <span>Add {formatPrice(freeShippingThreshold - subtotalINR, currency)} more for FREE shipping</span>
                <span>{Math.round((subtotalINR / freeShippingThreshold) * 100)}%</span>
              </div>
              <div className="w-full bg-[#d3c3c0] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#785a00] h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotalINR / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[#271310]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Package className="w-12 h-12 text-[#827472]/50 stroke-[1.5]" />
              <h4 className="font-bold text-sm text-[#271310] font-serif">Your shopping cart is empty</h4>
              <p className="text-xs text-[#504442] max-w-xs">
                Explore our single-origin ground coffee powders, instant 3-in-1 condensed milk boxes, and heirloom Phin drip kits.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-lg bg-[#785a00] text-white font-bold text-xs uppercase tracking-wide hover:bg-[#8e6b00] transition-colors"
              >
                Browse Coffee Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Product Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 rounded-xl border border-[#d3c3c0]/60 flex gap-3 shadow-2xs relative"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-[#f4ecea]"
                    />

                    <div className="flex-1 min-w-0 pr-6">
                      <h5 className="font-bold text-xs text-[#271310] truncate font-serif">{item.name}</h5>
                      <p className="text-[10px] text-[#785a00] italic truncate">{item.vietnameseName}</p>

                      {/* Size and Grind Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] bg-[#faf2f0] border border-[#d3c3c0] text-[#271310] px-1.5 py-0.2 rounded font-semibold">
                          {item.selectedSize}
                        </span>
                        {item.selectedGrind && (
                          <span className="text-[9px] bg-[#feca4d]/15 border border-[#feca4d]/40 text-[#785a00] px-1.5 py-0.2 rounded font-semibold truncate max-w-[140px]">
                            {item.selectedGrind}
                          </span>
                        )}
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#f4ecea]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-5 h-5 rounded bg-[#faf2f0] hover:bg-[#eee3e1] flex items-center justify-center text-[#271310] text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded bg-[#faf2f0] hover:bg-[#eee3e1] flex items-center justify-center text-[#271310] text-xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-xs text-[#271310] font-serif">
                          {formatPrice(item.unitPriceINR * item.quantity, currency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute top-3 right-3 text-[#827472] hover:text-red-600 transition-colors p-1"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="bg-white p-3.5 rounded-xl border border-[#d3c3c0]/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#785a00]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#271310]">
                    Discount Voucher
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter voucher code (optional)"
                    className="flex-1 bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-3 py-1.5 text-xs font-semibold uppercase text-[#271310] focus:outline-none focus:border-[#785a00]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3 py-1.5 rounded-lg bg-[#271310] text-white text-xs font-bold hover:bg-[#3d201c] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] font-semibold text-emerald-700">{promoSuccess}</p>
                )}
                {promoError && (
                  <p className="text-[11px] font-semibold text-rose-700">{promoError}</p>
                )}
              </div>

              {/* Shipping & Delivery Form */}
              <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#d3c3c0]/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#785a00] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      Shipping Address (All-India)
                    </span>
                  </div>

                  {/* Shipping Speed Choice */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShippingType('standard')}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        shippingType === 'standard'
                          ? 'bg-[#271310] text-white border-[#271310]'
                          : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                      }`}
                    >
                      <p className="font-bold">Standard Delivery</p>
                      <p className="text-[10px] opacity-80">3-5 business days</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingType('express')}
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        shippingType === 'express'
                          ? 'bg-[#271310] text-white border-[#271310]'
                          : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0]'
                      }`}
                    >
                      <p className="font-bold">Express Air Courier</p>
                      <p className="text-[10px] opacity-80">1-2 business days</p>
                    </button>
                  </div>

                  {/* Customer Inputs */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-[#827472] uppercase block">Full Name:</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#827472] uppercase block">Mobile Phone:</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#827472] uppercase block">Email for Tracking:</label>
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#827472] uppercase block">Address / Street / Flat:</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Flat/House No., Building, Street Name"
                        className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#827472] uppercase block">City & PIN Code:</label>
                      <input
                        type="text"
                        required
                        value={cityPincode}
                        onChange={(e) => setCityPincode(e.target.value)}
                        placeholder="City, PIN Code (e.g. Bengaluru, 560001)"
                        className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                      />
                    </div>
                  </div>

                  {/* Order Updates Email Notice */}
                  <div className="bg-[#f5ecea] p-2.5 rounded-lg border border-[#d3c3c0]/60 text-[11px] text-[#504442] flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-[#785a00] flex-shrink-0 mt-0.5" />
                    <span>
                      Order notifications & dispatch updates are tracked with your email and our roastery operations desk:{' '}
                      <strong className="text-[#271310]">Mritunjay.Bhardwaj@caphevietnam.in</strong>
                    </span>
                  </div>

                  {/* Gift Wrap Toggle */}
                  <div className="pt-2 border-t border-[#f4ecea]">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#271310]">
                      <input
                        type="checkbox"
                        checked={includeGiftWrap}
                        onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                        className="rounded border-[#d3c3c0] text-[#785a00] focus:ring-0"
                      />
                      <Gift className="w-3.5 h-3.5 text-[#785a00]" />
                      <span>Complimentary Gift Packaging & Note</span>
                    </label>
                    {includeGiftWrap && (
                      <textarea
                        rows={2}
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        className="w-full mt-2 bg-[#faf2f0] border border-[#d3c3c0] rounded-lg p-2 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
                        placeholder="Add your personalized message..."
                      />
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Cart Drawer Footer with Price Summary & Place Order */}
        {items.length > 0 && (
          <div className="bg-white p-5 border-t border-[#d3c3c0] space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-[#504442]">
              <div className="flex justify-between">
                <span>Products Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotalINR, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Courier Shipping</span>
                <span className="font-semibold">
                  {shippingFeeINR === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    formatPrice(shippingFeeINR, currency)
                  )}
                </span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(appliedDiscount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#271310] pt-2 border-t border-[#f4ecea]">
                <span>Total Amount</span>
                <span className="font-serif text-lg text-[#785a00]">
                  {formatPrice(finalTotalINR, currency)}
                </span>
              </div>
            </div>

            {/* Email Dispatch Feedback Status Banner */}
            {emailStatus === 'sending' && (
              <div className="p-2.5 rounded-lg bg-[#faf2f0] border border-[#d3c3c0] text-xs flex items-center gap-2 text-[#785a00]">
                <Loader2 className="w-4 h-4 animate-spin text-[#785a00] flex-shrink-0" />
                <span className="font-medium">Sending order emails to owner & customer via EmailJS...</span>
              </div>
            )}
            {emailStatus === 'success' && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs flex items-center gap-2 text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Both confirmation emails sent successfully!</span>
              </div>
            )}
            {emailStatus === 'error' && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>{emailStatusMessage || 'Could not verify email delivery.'}</span>
              </div>
            )}

            <button
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-[#504442] text-white cursor-wait opacity-80'
                  : emailStatus === 'success'
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  : 'bg-[#785a00] hover:bg-[#8e6b00] text-white cursor-pointer active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Emails & Placing Order...</span>
                </>
              ) : emailStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Emails Sent & Order Confirmed!</span>
                </>
              ) : (
                <>
                  <span>Place Coffee Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#827472]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Direct-Trade Guarantee • Fresh Roasted & Hermetically Sealed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
