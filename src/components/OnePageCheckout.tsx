import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { sendOrderEmails, EmailSendResult } from '../utils/emailService';
import { openRazorpayCheckout } from '../utils/razorpayService';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Check,
  Truck,
  CreditCard,
  Banknote,
  Gift,
  ShieldCheck,
  Lock,
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  MapPin,
  Sparkles
} from 'lucide-react';

interface OnePageCheckoutProps {
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onBackToShop: () => void;
  onOrderPlaced: (orderDetails: {
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

export const OnePageCheckout: React.FC<OnePageCheckoutProps> = ({
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onBackToShop,
  onOrderPlaced,
}) => {
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
      setPromoError('Invalid promo code. Try VIETNAM15 or FREESHIP.');
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
          onOrderPlaced({
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

        onOrderPlaced({
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
    setStepMessage('Opening secure Razorpay payment gateway...');

    let paymentResponse: any;
    try {
      paymentResponse = await openRazorpayCheckout({
        orderId,
        amountINR: finalTotalINR,
        customerName: cleanCustomerName,
        customerEmail: cleanCustomerEmail,
        customerPhone: cleanCustomerPhone,
        shippingAddress: `${cleanShippingAddress}, ${cleanCityPincode}`,
        description: `Order ${orderId} - Cà Phê Việt Nam (${items.length} items)`,
      });
      setCheckoutStep('payment_success');
      setStepMessage('Payment verified! Generating invoice & dispatching roastery emails...');
    } catch (paymentErr: any) {
      console.error('[Checkout] Razorpay payment aborted or failed:', paymentErr);
      setIsSubmitting(false);
      setCheckoutStep('error');
      setStepMessage(paymentErr?.message || 'Payment was cancelled or unsuccessful. Please try again.');
      return;
    }

    // Step 3: Send Confirmation Emails
    try {
      setCheckoutStep('sending_emails');
      const emailResult = await sendOrderEmails({
        orderId,
        items,
        customerName: cleanCustomerName,
        customerEmail: cleanCustomerEmail,
        customerPhone: cleanCustomerPhone,
        shippingAddress: cleanShippingAddress,
        cityPincode: cleanCityPincode,
        finalTotalINR,
        paymentMethod: 'Razorpay Online',
        paymentStatus: 'paid',
        paymentId: paymentResponse.razorpay_payment_id,
      });

      if (emailResult.success) {
        setCheckoutStep('success');
        setStepMessage('Order confirmed & confirmation emails dispatched!');
      } else {
        setCheckoutStep('error');
        setStepMessage(emailResult.message || 'Payment confirmed, but confirmation email dispatch was incomplete.');
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onOrderPlaced({
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
      console.error('[Checkout] Error executing email notification:', err);
      setIsSubmitting(false);
      setCheckoutStep('error');
      setStepMessage(err?.text || err?.message || 'Error executing email notification service.');

      onOrderPlaced({
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

  if (items.length === 0) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#f4ecea] flex items-center justify-center text-[#785a00] mx-auto shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-[#271310]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Coffee Cart is Empty
          </h2>
          <p className="text-xs text-[#504442] max-w-md mx-auto leading-relaxed">
            Select your favorite Vietnamese coffee powders, 3-in-1 instant sachets, or artisanal Phin brewing filters to begin checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Coffee Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Back Link */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d3c3c0]/60 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToShop}
            className="inline-flex items-center gap-1.5 text-xs text-[#785a00] hover:text-[#271310] font-semibold transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <h1
            className="font-serif font-bold text-2xl sm:text-3xl text-[#271310]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Express One-Page Checkout
          </h1>
          <p className="text-xs text-[#504442] mt-0.5">
            Review your coffee selection, enter your delivery address, and complete your order seamlessly.
          </p>
        </div>

        {/* Free Shipping Badge */}
        <div className="bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Truck className="w-5 h-5 text-[#785a00] flex-shrink-0" />
          <div className="text-xs">
            {subtotalINR >= freeShippingThreshold ? (
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Free Express Delivery Unlocked!
              </span>
            ) : (
              <span className="text-[#504442]">
                Add <strong className="text-[#785a00]">{formatPrice(freeShippingThreshold - subtotalINR, currency)}</strong> more for <strong>FREE Shipping</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Single-Page Checkout Form */}
      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Summary, Customer Details & Payment (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Cart Items Summary */}
            <div className="bg-white rounded-2xl border border-[#d3c3c0]/60 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f4ecea] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#785a00]" />
                  <h2 className="font-serif font-bold text-base text-[#271310]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    1. Coffee Selection ({items.reduce((a, b) => a + b.quantity, 0)} items)
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-[#785a00]">
                  Subtotal: {formatPrice(subtotalINR, currency)}
                </span>
              </div>

              <div className="divide-y divide-[#f4ecea]">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-[#f4ecea] flex-shrink-0 border border-[#d3c3c0]/40"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif font-bold text-xs sm:text-sm text-[#271310] truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-[#785a00] italic truncate">{item.vietnameseName}</p>
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-[#785a00] whitespace-nowrap">
                          {formatPrice(item.unitPriceINR * item.quantity, currency)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                        <span className="bg-[#faf2f0] border border-[#d3c3c0] text-[#271310] px-2 py-0.5 rounded-md font-semibold">
                          {item.selectedSize}
                        </span>
                        {item.selectedGrind && (
                          <span className="bg-[#feca4d]/15 border border-[#feca4d]/40 text-[#785a00] px-2 py-0.5 rounded-md font-semibold truncate max-w-[170px]">
                            {item.selectedGrind}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-md bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] flex items-center justify-center text-[#271310] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs text-[#271310] min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-md bg-[#faf2f0] hover:bg-[#eee3e1] border border-[#d3c3c0] flex items-center justify-center text-[#271310] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[#827472] hover:text-rose-700 p-1 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Shipping & Customer Details */}
            <div className="bg-white rounded-2xl border border-[#d3c3c0]/60 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#f4ecea] pb-3">
                <MapPin className="w-4 h-4 text-[#785a00]" />
                <h2 className="font-serif font-bold text-base text-[#271310]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  2. Shipping & Contact Information
                </h2>
              </div>

              {/* Delivery Speed Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#827472] uppercase block">
                  Delivery Speed (All-India Express Courier):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShippingType('standard')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                      shippingType === 'standard'
                        ? 'bg-[#271310] text-white border-[#271310] shadow-2xs'
                        : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0] hover:bg-[#eee3e1]'
                    }`}
                  >
                    <Package className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#feca4d]" />
                    <div>
                      <p className="font-bold">Standard Delivery</p>
                      <p className="text-[10px] opacity-80">3-5 business days (Free over ₹799)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingType('express')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                      shippingType === 'express'
                        ? 'bg-[#271310] text-white border-[#271310] shadow-2xs'
                        : 'bg-[#faf2f0] text-[#504442] border-[#d3c3c0] hover:bg-[#eee3e1]'
                    }`}
                  >
                    <Truck className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#feca4d]" />
                    <div>
                      <p className="font-bold">Express Air Courier</p>
                      <p className="text-[10px] opacity-80">1-2 business days with priority dispatch</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label htmlFor="customerName" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                    Full Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (checkoutStep === 'error') setStepMessage(null);
                    }}
                    placeholder="Enter your full name"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                    Mobile Phone (Courier Updates) *
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (checkoutStep === 'error') setStepMessage(null);
                    }}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="customerEmail" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                    Email Address (For Invoice & Order Verification) *
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (checkoutStep === 'error') setStepMessage(null);
                    }}
                    placeholder="your.email@example.com"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                  />
                  <p className="text-[10px] text-[#827472] mt-0.5">
                    Your order invoice and tracking details will be verified using this email.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="shippingAddress" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                    Street Address / Flat / Building *
                  </label>
                  <input
                    id="shippingAddress"
                    name="shippingAddress"
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => {
                      setShippingAddress(e.target.value);
                      if (checkoutStep === 'error') setStepMessage(null);
                    }}
                    placeholder="Flat/House No., Building Name, Street"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="cityPincode" className="text-[10px] font-bold text-[#827472] uppercase block mb-1">
                    City, State & Postal PIN Code *
                  </label>
                  <input
                    id="cityPincode"
                    name="cityPincode"
                    type="text"
                    required
                    value={cityPincode}
                    onChange={(e) => {
                      setCityPincode(e.target.value);
                      if (checkoutStep === 'error') setStepMessage(null);
                    }}
                    placeholder="e.g. Bengaluru, Karnataka - 560001"
                    className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3 py-2 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
                  />
                </div>
              </div>

              {/* Complimentary Gift Packaging Option */}
              <div className="pt-2 border-t border-[#f4ecea]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#271310]">
                  <input
                    type="checkbox"
                    checked={includeGiftWrap}
                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                    className="rounded border-[#d3c3c0] text-[#785a00] focus:ring-0 cursor-pointer"
                  />
                  <Gift className="w-4 h-4 text-[#785a00]" />
                  <span>Complimentary Gift Packaging & Personal Note</span>
                </label>
                {includeGiftWrap && (
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="w-full mt-2 bg-[#faf2f0] border border-[#d3c3c0] rounded-xl p-2.5 text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
                    placeholder="Write your personal gift message to be handwritten inside..."
                  />
                )}
              </div>
            </div>

            {/* Section 3: Payment Method Selection */}
            <div className="bg-white rounded-2xl border border-[#d3c3c0]/60 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#f4ecea] pb-3">
                <CreditCard className="w-4 h-4 text-[#785a00]" />
                <h2 className="font-serif font-bold text-base text-[#271310]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  3. Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Razorpay Online Option */}
                <button
                  type="button"
                  id="checkout-payment-online"
                  onClick={() => {
                    setPaymentMethod('online');
                    if (checkoutStep === 'error') setStepMessage(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'online'
                      ? 'bg-[#faf2f0] border-[#785a00] text-[#271310] ring-2 ring-[#785a00]/30 shadow-xs'
                      : 'bg-white border-[#d3c3c0] text-[#504442] hover:bg-[#faf2f0]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#feca4d]/20 flex items-center justify-center text-[#785a00]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    {paymentMethod === 'online' && (
                      <span className="w-5 h-5 rounded-full bg-[#785a00] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-[#271310]">Pay Online (Razorpay)</span>
                    <span className="text-[11px] text-[#827472] block mt-0.5">UPI, Cards, NetBanking, Wallets</span>
                  </div>
                </button>

                {/* Cash on Delivery Option */}
                <button
                  type="button"
                  id="checkout-payment-cod"
                  onClick={() => {
                    setPaymentMethod('cod');
                    if (checkoutStep === 'error') setStepMessage(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === 'cod'
                      ? 'bg-[#faf2f0] border-[#785a00] text-[#271310] ring-2 ring-[#785a00]/30 shadow-xs'
                      : 'bg-white border-[#d3c3c0] text-[#504442] hover:bg-[#faf2f0]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#feca4d]/20 flex items-center justify-center text-[#785a00]">
                      <Banknote className="w-4 h-4" />
                    </div>
                    {paymentMethod === 'cod' && (
                      <span className="w-5 h-5 rounded-full bg-[#785a00] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-[#271310]">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-[#827472] block mt-0.5">Pay safely upon courier arrival</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Pricing Summary & Place Order (5 Cols, Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-6 shadow-md space-y-5">
              <h2
                className="font-serif font-bold text-lg text-[#271310] border-b border-[#f4ecea] pb-3"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Order Summary
              </h2>

              {/* Promo Code Input */}
              <div className="space-y-1.5">
                <label htmlFor="promoCode" className="text-[10px] font-bold text-[#827472] uppercase block">
                  Promo / Roastery Voucher:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
                    <input
                      id="promoCode"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. VIETNAM15"
                      className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-[#271310] uppercase placeholder:normal-case placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-[#271310] text-white text-xs font-bold rounded-xl hover:bg-[#3d201c] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {promoSuccess}
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {promoError}
                  </p>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 text-xs text-[#504442] border-t border-[#f4ecea] pt-3">
                <div className="flex justify-between">
                  <span>Coffee Items Subtotal</span>
                  <span className="font-semibold text-[#271310]">{formatPrice(subtotalINR, currency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping & Handling</span>
                  <span>
                    {shippingFeeINR === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Free All-India
                      </span>
                    ) : (
                      <span className="font-semibold text-[#271310]">{formatPrice(shippingFeeINR, currency)}</span>
                    )}
                  </span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Special Promo Discount</span>
                    <span>-{formatPrice(appliedDiscount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#271310] pt-3 border-t border-[#f4ecea]">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl text-[#785a00]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {formatPrice(finalTotalINR, currency)}
                  </span>
                </div>
              </div>

              {/* Status Banner */}
              {(checkoutStep === 'payment_pending' || checkoutStep === 'sending_emails') && (
                <div className="p-3 rounded-xl bg-[#faf2f0] border border-[#d3c3c0] text-xs flex items-center gap-2.5 text-[#785a00]">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span className="font-medium">{stepMessage || 'Processing checkout...'}</span>
                </div>
              )}
              {checkoutStep === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center gap-2.5 text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">{stepMessage || 'Order confirmed successfully!'}</span>
                </div>
              )}
              {checkoutStep === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs flex items-center gap-2.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                  <span className="font-medium">{stepMessage || 'An error occurred during checkout.'}</span>
                </div>
              )}

              {/* Main Place Order Button */}
              <button
                type="submit"
                id="place-order-button"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : paymentMethod === 'cod' ? (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Confirm & Place Order ({formatPrice(finalTotalINR, currency)})</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay & Place Order ({formatPrice(finalTotalINR, currency)})</span>
                  </>
                )}
              </button>

              {/* Trust & Guarantee Notes */}
              <div className="pt-2 border-t border-[#f4ecea] space-y-2 text-[11px] text-[#827472]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>Direct-Trade Certified • 100% Vietnamese Robusta & Arabica</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#785a00] flex-shrink-0" />
                  <span>256-bit Encrypted SSL Checkout • Official Razorpay Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
