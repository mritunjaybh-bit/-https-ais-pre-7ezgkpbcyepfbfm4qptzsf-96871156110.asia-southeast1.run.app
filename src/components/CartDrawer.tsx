import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { sendOrderEmails, EmailSendResult } from '../utils/emailService';
import { openRazorpayCheckout } from '../utils/razorpayService';
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
  AlertCircle,
  CreditCard,
  Banknote
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
    paymentStatus?: 'paid' | 'pending' | 'Pending (COD)' | 'failed' | string;
    paymentId?: string;
    paymentMethod?: string;
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
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [includeGiftWrap, setIncludeGiftWrap] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<
    'idle' | 'payment_pending' | 'payment_success' | 'sending_emails' | 'success' | 'error'
  >('idle');
  const [stepMessage, setStepMessage] = useState<string | null>(null);

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

  // Form Validation
  const validateForm = (): string | null => {
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const email = customerEmail.trim();
    const address = shippingAddress.trim();
    const cityPin = cityPincode.trim();

    if (!name || !phone || !email || !address || !cityPin) {
      return 'Please fill in all delivery and contact fields.';
    }
    if (name.length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return 'Please enter a valid mobile phone number (at least 10 digits).';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return 'Please enter a valid email address (e.g. yourname@example.com).';
    }
    if (address.length < 5) {
      return 'Please provide complete delivery street or flat address.';
    }
    if (cityPin.length < 3) {
      return 'Please provide your delivery city and postal PIN code.';
    }
    return null;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    // Step 1: Form Validation
    const validationError = validateForm();
    if (validationError) {
      setCheckoutStep('error');
      setStepMessage(validationError);
      return;
    }

    const orderId = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const cleanCustomerName = customerName.trim();
    const cleanCustomerPhone = customerPhone.trim();
    const cleanCustomerEmail = customerEmail.trim();
    const cleanShippingAddress = shippingAddress.trim();
    const cleanCityPincode = cityPincode.trim();

    // Handle Cash on Delivery (COD) Option
    if (paymentMethod === 'cod') {
      setIsSubmitting(true);
      setCheckoutStep('sending_emails');
      setStepMessage('Placing Cash on Delivery order & dispatching confirmation emails...');

      try {
        const emailResult: EmailSendResult = await sendOrderEmails({
          orderId,
          items,
          customerName: cleanCustomerName,
          customerEmail: cleanCustomerEmail,
          customerPhone: cleanCustomerPhone,
          shippingAddress: cleanShippingAddress,
          cityPincode: cleanCityPincode,
          finalTotalINR,
          paymentMethod: 'COD',
          paymentStatus: 'Pending (COD)',
        });

        if (emailResult.success) {
          setCheckoutStep('success');
          setStepMessage('Cash on Delivery order placed & confirmation emails dispatched!');
        } else {
          console.warn('[EmailJS] Email dispatch incomplete for COD order:', emailResult);
          setCheckoutStep('error');
          setStepMessage(emailResult.message || 'COD order placed, but confirmation email dispatch was incomplete.');
        }

        setTimeout(() => {
          setIsSubmitting(false);
          onCheckout({
            orderId,
            shippingType,
            shippingAddress: cleanShippingAddress,
            cityPincode: cleanCityPincode,
            customerName: cleanCustomerName,
            customerPhone: cleanCustomerPhone,
            customerEmail: cleanCustomerEmail,
            giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
            discountINR: appliedDiscount,
            finalTotalINR,
            paymentStatus: 'Pending (COD)',
            paymentId: `COD-${Date.now().toString(36).toUpperCase()}`,
            paymentMethod: 'COD',
            emailSentSuccess: emailResult.success,
            emailMessage: emailResult.message,
          });
        }, 700);
      } catch (err: any) {
        console.error('[Checkout] Error executing COD email notification:', err);
        setIsSubmitting(false);
        setCheckoutStep('error');
        setStepMessage(err?.text || err?.message || 'Error sending confirmation email for COD order.');

        onCheckout({
          orderId,
          shippingType,
          shippingAddress: cleanShippingAddress,
          cityPincode: cleanCityPincode,
          customerName: cleanCustomerName,
          customerPhone: cleanCustomerPhone,
          customerEmail: cleanCustomerEmail,
          giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
          discountINR: appliedDiscount,
          finalTotalINR,
          paymentStatus: 'Pending (COD)',
          paymentId: `COD-${Date.now().toString(36).toUpperCase()}`,
          paymentMethod: 'COD',
          emailSentSuccess: false,
          emailMessage: 'Email delivery pending roastery connection.',
        });
      }
      return;
    }

    // Step 2: Razorpay Online Payment Flow
    setIsSubmitting(true);
    setCheckoutStep('payment_pending');
    setStepMessage('Opening secure Razorpay payment gateway (UPI, Cards, Wallets)...');

    // Step 2: Razorpay Payment
    let paymentResponse: {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };
    try {
      paymentResponse = await openRazorpayCheckout({
        orderId,
        amountINR: finalTotalINR,
        customerName: cleanCustomerName,
        customerEmail: cleanCustomerEmail,
        customerPhone: cleanCustomerPhone,
        shippingAddress: `${cleanShippingAddress}, ${cleanCityPincode}`,
      });
      console.log('[Payment] Razorpay payment successful:', paymentResponse);
    } catch (paymentErr: any) {
      console.error('[Payment] Razorpay payment declined/failed/cancelled:', paymentErr);
      setIsSubmitting(false);
      setCheckoutStep('error');
      // On failed payment, show an error and do NOT submit the order
      setStepMessage(
        paymentErr?.message || 'Payment transaction was declined or cancelled. Your order has not been placed.'
      );
      return;
    }

    // Step 3: Payment Succeeded -> Send Both Order Emails via EmailJS
    setCheckoutStep('sending_emails');
    setStepMessage(`Payment verified (ID: ${paymentResponse.razorpay_payment_id})! Sending confirmation emails...`);

    try {
      const emailResult: EmailSendResult = await sendOrderEmails({
        orderId,
        items,
        customerName: cleanCustomerName,
        customerEmail: cleanCustomerEmail,
        customerPhone: cleanCustomerPhone,
        shippingAddress: cleanShippingAddress,
        cityPincode: cleanCityPincode,
        finalTotalINR,
      });

      if (emailResult.success) {
        setCheckoutStep('success');
        setStepMessage('Payment confirmed & both confirmation emails dispatched successfully!');
      } else {
        // Log/show error if either fails
        console.warn('[EmailJS] One or more emails failed:', emailResult);
        setCheckoutStep('error');
        setStepMessage(emailResult.message || 'Payment confirmed, but confirmation email dispatch was incomplete.');
      }

      // Step 4: Finalize local order & trigger receipt modal
      setTimeout(() => {
        setIsSubmitting(false);
        onCheckout({
          orderId,
          shippingType,
          shippingAddress: cleanShippingAddress,
          cityPincode: cleanCityPincode,
          customerName: cleanCustomerName,
          customerPhone: cleanCustomerPhone,
          customerEmail: cleanCustomerEmail,
          giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
          discountINR: appliedDiscount,
          finalTotalINR,
          paymentStatus: 'paid',
          paymentId: paymentResponse.razorpay_payment_id,
          paymentMethod: 'Razorpay Online (UPI/Cards/Wallets)',
          emailSentSuccess: emailResult.success,
          emailMessage: emailResult.message,
        });
      }, 700);
    } catch (err: any) {
      console.error('[Checkout] Email execution error after payment:', err);
      setIsSubmitting(false);
      setCheckoutStep('error');
      setStepMessage(err?.text || err?.message || 'Error executing email notification service.');

      // Payment was already captured, ensure user still gets their order confirmation
      onCheckout({
        orderId,
        shippingType,
        shippingAddress: cleanShippingAddress,
        cityPincode: cleanCityPincode,
        customerName: cleanCustomerName,
        customerPhone: cleanCustomerPhone,
        customerEmail: cleanCustomerEmail,
        giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
        discountINR: appliedDiscount,
        finalTotalINR,
        paymentStatus: 'paid',
        paymentId: paymentResponse.razorpay_payment_id,
        paymentMethod: 'Razorpay Online (UPI/Cards/Wallets)',
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
                      <label htmlFor="customer_name" className="text-[10px] font-bold text-[#827472] uppercase block">
                        Full Name:
                      </label>
                      <input
                        id="customer_name"
                        name="customer_name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (checkoutStep === 'error') setStepMessage(null);
                        }}
                        placeholder="Enter your full name"
                        className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="customer_phone" className="text-[10px] font-bold text-[#827472] uppercase block">
                          Mobile Phone:
                        </label>
                        <input
                          id="customer_phone"
                          name="customer_phone"
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => {
                            setCustomerPhone(e.target.value);
                            if (checkoutStep === 'error') setStepMessage(null);
                          }}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                        />
                      </div>
                      <div>
                        <label htmlFor="customer_email" className="text-[10px] font-bold text-[#827472] uppercase block">
                          Email for Tracking:
                        </label>
                        <input
                          id="customer_email"
                          name="customer_email"
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value);
                            if (checkoutStep === 'error') setStepMessage(null);
                          }}
                          placeholder="your.email@example.com"
                          className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="shipping_address" className="text-[10px] font-bold text-[#827472] uppercase block">
                        Address / Street / Flat:
                      </label>
                      <input
                        id="shipping_address"
                        name="shipping_address"
                        type="text"
                        required
                        value={shippingAddress}
                        onChange={(e) => {
                          setShippingAddress(e.target.value);
                          if (checkoutStep === 'error') setStepMessage(null);
                        }}
                        placeholder="Flat/House No., Building, Street Name"
                        className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                      />
                    </div>

                    <div>
                      <label htmlFor="city_pincode" className="text-[10px] font-bold text-[#827472] uppercase block">
                        City & PIN Code:
                      </label>
                      <input
                        id="city_pincode"
                        name="city_pincode"
                        type="text"
                        required
                        value={cityPincode}
                        onChange={(e) => {
                          setCityPincode(e.target.value);
                          if (checkoutStep === 'error') setStepMessage(null);
                        }}
                        placeholder="City, PIN Code (e.g. Bengaluru, 560001)"
                        className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg px-2.5 py-1.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                      />
                    </div>
                  </div>

                  {/* Order Updates Notice */}
                  <div className="bg-[#f5ecea] p-2.5 rounded-lg border border-[#d3c3c0]/60 text-[11px] text-[#504442] flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-[#785a00] flex-shrink-0 mt-0.5" />
                    <span>
                      A digital invoice, roasting status, and air express tracking number will be dispatched to your email address once your order is confirmed.
                    </span>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-2 pt-2 border-t border-[#f4ecea]">
                    <label className="text-[10px] font-bold text-[#827472] uppercase block">
                      Payment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        id="payment-method-online"
                        onClick={() => {
                          setPaymentMethod('online');
                          if (checkoutStep === 'error') setStepMessage(null);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'online'
                            ? 'bg-[#faf2f0] border-[#785a00] text-[#271310] ring-1 ring-[#785a00]'
                            : 'bg-white border-[#d3c3c0] text-[#504442] hover:bg-[#faf2f0]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <CreditCard className={`w-3.5 h-3.5 ${paymentMethod === 'online' ? 'text-[#785a00]' : 'text-[#827472]'}`} />
                          {paymentMethod === 'online' && <Check className="w-3.5 h-3.5 text-[#785a00]" />}
                        </div>
                        <span className="font-bold text-xs block">Pay Online (Razorpay)</span>
                        <span className="text-[10px] text-[#827472] block">UPI, Cards, Wallets</span>
                      </button>

                      <button
                        type="button"
                        id="payment-method-cod"
                        onClick={() => {
                          setPaymentMethod('cod');
                          if (checkoutStep === 'error') setStepMessage(null);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentMethod === 'cod'
                            ? 'bg-[#faf2f0] border-[#785a00] text-[#271310] ring-1 ring-[#785a00]'
                            : 'bg-white border-[#d3c3c0] text-[#504442] hover:bg-[#faf2f0]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Banknote className={`w-3.5 h-3.5 ${paymentMethod === 'cod' ? 'text-[#785a00]' : 'text-[#827472]'}`} />
                          {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 text-[#785a00]" />}
                        </div>
                        <span className="font-bold text-xs block">Cash on Delivery</span>
                        <span className="text-[10px] text-[#827472] block">Pay on delivery</span>
                      </button>
                    </div>
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

            {/* Checkout & Email Feedback Status Banner */}
            {(checkoutStep === 'payment_pending' || checkoutStep === 'sending_emails') && (
              <div className="p-2.5 rounded-lg bg-[#faf2f0] border border-[#d3c3c0] text-xs flex items-center gap-2 text-[#785a00]">
                <Loader2 className="w-4 h-4 animate-spin text-[#785a00] flex-shrink-0" />
                <span className="font-medium">{stepMessage || 'Processing checkout...'}</span>
              </div>
            )}
            {checkoutStep === 'success' && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs flex items-center gap-2 text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{stepMessage || 'Payment verified & order emails sent successfully!'}</span>
              </div>
            )}
            {checkoutStep === 'error' && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>{stepMessage || 'Payment or validation error.'}</span>
              </div>
            )}

            <button
              id="place-order-button"
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-[#504442] text-white cursor-wait opacity-80'
                  : checkoutStep === 'success'
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                  : 'bg-[#785a00] hover:bg-[#8e6b00] text-white cursor-pointer active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {checkoutStep === 'payment_pending'
                      ? 'Processing Razorpay Payment...'
                      : paymentMethod === 'cod'
                      ? 'Placing COD Order...'
                      : 'Sending Emails & Placing Order...'}
                  </span>
                </>
              ) : checkoutStep === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>{paymentMethod === 'cod' ? 'COD Order Confirmed!' : 'Payment & Emails Confirmed!'}</span>
                </>
              ) : (
                <>
                  <span>{paymentMethod === 'cod' ? 'Place Order (Cash on Delivery)' : 'Pay Online (Razorpay)'}</span>
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
