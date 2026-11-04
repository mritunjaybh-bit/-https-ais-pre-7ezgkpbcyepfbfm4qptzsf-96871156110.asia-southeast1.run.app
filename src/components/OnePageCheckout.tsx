import React, { useState, useEffect } from 'react';
import { CartItem, Currency, PlacedOrder } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { sendOrderEmails, EmailSendResult } from '../utils/emailService';
import { openRazorpayCheckout } from '../utils/razorpayService';
import { saveOrder, saveOrderAsync } from '../utils/orderStorage';
import { trackInitiateCheckout, trackPurchase } from '../utils/metaPixel';
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
    items?: CartItem[];
  }) => void;
  siteSettings?: any;
}

export const OnePageCheckout: React.FC<OnePageCheckoutProps> = ({
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onBackToShop,
  onOrderPlaced,
  siteSettings,
}) => {
  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [cityPincode, setCityPincode] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [marketingEmailConsent, setMarketingEmailConsent] = useState<boolean>(false);
  const [marketingWhatsAppConsent, setMarketingWhatsAppConsent] = useState<boolean>(false);
  const [circleBeansBalance, setCircleBeansBalance] = useState<number | null>(null);
  const [circleBeansRedeemed, setCircleBeansRedeemed] = useState<number>(0);
  const [circleBeansLoading, setCircleBeansLoading] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod');
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
  const freeShippingThreshold = siteSettings?.freeShippingThreshold || 799;
  const isFreeShipping = subtotalINR >= freeShippingThreshold;
  const shippingFeeINR = isFreeShipping
    ? shippingType === 'express'
      ? 120
      : 0
    : shippingType === 'express'
    ? 180
    : 80;

  // Track Meta Pixel InitiateCheckout on checkout mount & pre-fill email if captured via popup
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        items,
        total: subtotalINR + shippingFeeINR,
        currency: 'INR',
      });
    }

    // Pre-fill email from welcome popup subscription if available
    try {
      const savedSubscriberEmail = localStorage.getItem('caphe_subscriber_email');
      if (savedSubscriberEmail && !customerEmail) {
        setCustomerEmail(savedSubscriberEmail);
      }
    } catch {}
  }, []);

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'XINCHAO10' || code === 'CAPHE10' || code === 'WELCOME10') {
      const discount = Math.round(subtotalINR * 0.10);
      setAppliedDiscount(discount);
      setPromoSuccess('10% Welcome discount applied!');
    } else if (code === 'VIETNAM15' || code === 'XINCHAO') {
      const discount = Math.round(subtotalINR * 0.15);
      setAppliedDiscount(discount);
      setPromoSuccess('15% Coffee discount applied!');
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(shippingFeeINR);
      setPromoSuccess('Free express courier applied!');
    } else {
      setPromoError('Invalid promo code. Try XINCHAO10, VIETNAM15 or FREESHIP.');
      setAppliedDiscount(0);
    }
  };

  const beansDiscount = Math.round((circleBeansRedeemed / 100) * 50);
  const finalTotalINR = Math.max(0, subtotalINR + shippingFeeINR - appliedDiscount - beansDiscount);

  const handleLookupBeans = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      setPromoError('Please enter a valid email address in the delivery form first.');
      return;
    }
    setCircleBeansLoading(true);
    setPromoError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'circle-member', email: customerEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data?.member) {
        setCircleBeansBalance(data.member.beansBalance || 0);
      } else {
        setCircleBeansBalance(0);
      }
    } catch {
      setCircleBeansBalance(0);
    } finally {
      setCircleBeansLoading(false);
    }
  };

  const handleApplyBeans = (beansCount: number) => {
    const maxDiscountAllowed = Math.round(subtotalINR * 0.3); // max 30% discount
    const potentialDiscount = Math.round((beansCount / 100) * 50);
    if (potentialDiscount > maxDiscountAllowed) {
      const adjustedBeans = Math.floor((maxDiscountAllowed / 50) * 100);
      setCircleBeansRedeemed(adjustedBeans);
      setPromoSuccess(`Applied ${adjustedBeans} Beans (₹${Math.round((adjustedBeans / 100) * 50)} discount, maximum 30% per order).`);
    } else {
      setCircleBeansRedeemed(beansCount);
      setPromoSuccess(`Applied ${beansCount} Beans (₹${potentialDiscount} discount)!`);
    }
  };

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

      const codPaymentId = `COD-${Date.now().toString(36).toUpperCase()}`;

      // 1. Immediately create and guarantee order is saved to server database & localStorage first
      const placedOrderData: PlacedOrder = {
        orderId,
        shippingType,
        shippingAddress: cleanShippingAddress,
        cityPincode: cleanCityPincode,
        customerName: cleanCustomerName,
        customerPhone: cleanCustomerPhone,
        customerEmail: cleanCustomerEmail,
        giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
        discountINR: appliedDiscount + beansDiscount,
        finalTotalINR,
        items: [...items],
        createdAt: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'Order Placed & Roasting',
        courierPartner: shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface',
        trackingNumber: `BD-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        paymentStatus: 'Pending (COD)',
        paymentId: codPaymentId,
        paymentMethod: 'COD',
        emailSentSuccess: true,
      };

      try {
        await saveOrderAsync(placedOrderData);
      } catch (saveErr) {
        console.warn('[Checkout] Preliminary order save warning:', saveErr);
      }

      // Background subscriber registration & circle beans redemption
      if (marketingEmailConsent) {
        fetch('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanCustomerEmail, source: 'checkout_consent' }),
        }).catch(() => {});
      }
      if (circleBeansRedeemed > 0) {
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'circle-redeem',
            email: cleanCustomerEmail,
            beans: circleBeansRedeemed,
            orderId,
            orderTotal: finalTotalINR,
          }),
        }).catch(() => {});
      }

      // 2. Dispatch confirmation emails
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

        placedOrderData.emailSentSuccess = emailResult.success;
        placedOrderData.emailMessage = emailResult.message;

        // Update stored record with email status
        await saveOrderAsync(placedOrderData);

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
          onOrderPlaced(placedOrderData);
        }, 500);
      } catch (err: any) {
        console.error('[Checkout] Error executing COD email notification:', err);
        setIsSubmitting(false);
        setCheckoutStep('error');
        setStepMessage(err?.text || err?.message || 'Error sending confirmation email for COD order.');

        placedOrderData.emailSentSuccess = false;
        placedOrderData.emailMessage = 'Email delivery pending roastery connection.';
        await saveOrderAsync(placedOrderData);
        onOrderPlaced(placedOrderData);
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
      setStepMessage('Online payment is temporarily unavailable. Please choose Cash on Delivery.');
      setPaymentMethod('cod');
      return;
    }

    // Step 3: Immediately persist confirmed paid order to server database & localStorage
    const onlineOrderData: PlacedOrder = {
      orderId,
      shippingType,
      shippingAddress: cleanShippingAddress,
      cityPincode: cleanCityPincode,
      customerName: cleanCustomerName,
      customerPhone: cleanCustomerPhone,
      customerEmail: cleanCustomerEmail,
      giftMessage: includeGiftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
      discountINR: appliedDiscount + beansDiscount,
      finalTotalINR,
      items: [...items],
      createdAt: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'Order Placed & Roasting',
      courierPartner: shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface',
      trackingNumber: `BD-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentStatus: 'paid',
      paymentId: paymentResponse.razorpay_payment_id,
      paymentMethod: 'Razorpay Online (UPI/Cards/Wallets)',
      emailSentSuccess: true,
    };

    try {
      await saveOrderAsync(onlineOrderData);
    } catch (saveErr) {
      console.warn('[Checkout] Preliminary online order save warning:', saveErr);
    }

    // Background subscriber registration & circle beans redemption
    if (marketingEmailConsent) {
      fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanCustomerEmail, source: 'checkout_consent' }),
      }).catch(() => {});
    }
    if (circleBeansRedeemed > 0) {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'circle-redeem',
          email: cleanCustomerEmail,
          beans: circleBeansRedeemed,
          orderId,
          orderTotal: finalTotalINR,
        }),
      }).catch(() => {});
    }

    // Step 4: Send Confirmation Emails
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

      onlineOrderData.emailSentSuccess = emailResult.success;
      onlineOrderData.emailMessage = emailResult.message;

      // Update stored record with email outcome
      await saveOrderAsync(onlineOrderData);

      if (emailResult.success) {
        setCheckoutStep('success');
        setStepMessage('Order confirmed & confirmation emails dispatched!');
      } else {
        setCheckoutStep('error');
        setStepMessage(emailResult.message || 'Payment confirmed, but confirmation email dispatch was incomplete.');
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onOrderPlaced(onlineOrderData);
      }, 500);
    } catch (err: any) {
      console.error('[Checkout] Error executing email notification:', err);
      setIsSubmitting(false);
      setCheckoutStep('error');
      setStepMessage(err?.text || err?.message || 'Error executing email notification service.');

      onlineOrderData.emailSentSuccess = false;
      onlineOrderData.emailMessage = 'Email delivery pending roastery connection.';
      await saveOrderAsync(onlineOrderData);
      onOrderPlaced(onlineOrderData);
    }
  };

  const isDirectCheckoutEnabled = Boolean(siteSettings?.directCheckoutEnabled);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [waitlistInterest, setWaitlistInterest] = useState(
    items.length > 0 ? items.map((i) => i.name).join(', ') : 'Vietnamese 3-in-1 Instant Coffee'
  );
  const [waitlistConsent, setWaitlistConsent] = useState(false);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError(null);
    const clean = waitlistEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setWaitlistError('Please provide a valid email address.');
      return;
    }
    if (!waitlistConsent) {
      setWaitlistError('Please tick the consent checkbox to receive launch notices.');
      return;
    }
    setWaitlistSubmitting(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: clean,
          phone: waitlistPhone.trim() || undefined,
          interest: waitlistInterest.trim() || 'General Launch Collection',
          consent: true,
          source: 'checkout_waitlist_mode',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaitlistSuccess(true);
      } else {
        setWaitlistError(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setWaitlistError('Network error. Please try again.');
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  // If direct checkout is not enabled by roastery owner, display Waitlist Mode
  if (!isDirectCheckoutEnabled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 sm:py-24 font-sans">
        <div className="bg-[#140d09] text-[#fcfbf7] border border-[#c5a880]/40 p-8 sm:p-12 shadow-2xl relative space-y-8">
          <div className="space-y-3 text-center border-b border-[#c5a880]/20 pb-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-medium block">
              Launching Soon in India
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#fcfbf7]">
              Checkout is in Waitlist Mode
            </h1>
            <p className="text-xs sm:text-sm text-[#dcd4cb] font-light max-w-lg mx-auto leading-relaxed">
              Online payments and Cash on Delivery will activate upon our official brand launch in India. Our planned range is currently in final evaluation.
            </p>
          </div>

          {waitlistSuccess ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#c5a880]/15 border border-[#c5a880]/50 text-[#c5a880] flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#fcfbf7]">
                  You are registered on the waitlist
                </h3>
                <p className="text-xs text-[#a3978f] font-light leading-relaxed max-w-md mx-auto">
                  We have recorded your details. You will receive private early-access notification at <span className="text-[#fcfbf7] underline">{waitlistEmail}</span> the moment orders open in India.
                </p>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onBackToShop}
                  className="px-8 py-3 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
                >
                  Return to Planned Range
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="space-y-5">
              {waitlistError && (
                <div className="p-3 bg-red-950/60 border border-red-800/60 text-red-200 text-xs">
                  {waitlistError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-[#c5a880] mb-1.5">
                    Product / Selection of Interest
                  </label>
                  <input
                    type="text"
                    value={waitlistInterest}
                    onChange={(e) => setWaitlistInterest(e.target.value)}
                    className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 focus:border-[#c5a880] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-[#c5a880] mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 placeholder-[#6f645e] focus:border-[#c5a880] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-[#a3978f] mb-1.5">
                    Phone Number <span className="text-[10px] text-[#6f645e] lowercase font-light">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={waitlistPhone}
                    onChange={(e) => setWaitlistPhone(e.target.value)}
                    className="w-full bg-[#1e1511] border border-[#c5a880]/30 text-[#fcfbf7] text-xs px-3.5 py-2.5 placeholder-[#6f645e] focus:border-[#c5a880] focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#a3978f] font-light leading-relaxed select-none">
                    <input
                      type="checkbox"
                      checked={waitlistConsent}
                      onChange={(e) => setWaitlistConsent(e.target.checked)}
                      className="mt-0.5 rounded-none border-[#c5a880]/40 bg-[#1e1511] text-[#c5a880] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#c5a880]"
                    />
                    <span>
                      I agree to receive launch updates and product availability notifications.
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={waitlistSubmitting}
                  className="w-full sm:flex-1 py-3.5 bg-[#c5a880] hover:bg-[#d8be98] text-[#140d09] text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {waitlistSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Join Launch Waitlist</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBackToShop}
                  className="w-full sm:w-auto px-5 py-3.5 border border-[#c5a880]/40 text-[#dcd4cb] hover:text-[#fcfbf7] text-xs uppercase tracking-[0.18em] transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[900px] mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#f4ecea] flex items-center justify-center text-[#785a00] mx-auto shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-[#271310]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Coffee Cart is Empty
          </h2>
          <p className="text-xs text-[#504442] max-w-md mx-auto leading-relaxed">
            Select your favorite Vietnamese coffee products to begin checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Planned Range</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
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

              {/* Marketing & Dispatch Communication Consent (Unticked by default) */}
              <div className="pt-3 border-t border-[#f4ecea] space-y-2">
                <span className="text-[10px] font-bold text-[#827472] uppercase block">
                  Communication Preferences:
                </span>
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#504442]">
                  <input
                    type="checkbox"
                    checked={marketingEmailConsent}
                    onChange={(e) => setMarketingEmailConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[#d3c3c0] text-[#785a00] focus:ring-0 cursor-pointer"
                  />
                  <span>Receive brand announcements, new flavour releases, and tasting dispatches via Email.</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#504442]">
                  <input
                    type="checkbox"
                    checked={marketingWhatsAppConsent}
                    onChange={(e) => setMarketingWhatsAppConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[#d3c3c0] text-[#785a00] focus:ring-0 cursor-pointer"
                  />
                  <span>Receive real-time courier dispatch and live tracking updates via WhatsApp.</span>
                </label>
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

              {/* Cà Phê Circle Beans Loyalty Redemption Widget */}
              <div className="p-3.5 rounded-xl bg-[#faf2f0] border border-[#c5a880]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#785a00] uppercase tracking-wider">
                    Cà Phê Circle Beans:
                  </span>
                  {circleBeansBalance !== null && (
                    <span className="text-xs font-mono font-bold text-[#271310]">
                      Balance: {circleBeansBalance} Beans
                    </span>
                  )}
                </div>

                {circleBeansBalance === null ? (
                  <button
                    type="button"
                    onClick={handleLookupBeans}
                    disabled={circleBeansLoading}
                    className="w-full py-2 px-3 rounded-lg bg-white border border-[#c5a880]/50 hover:bg-[#fbf9f5] text-xs text-[#271310] font-medium transition-colors cursor-pointer text-center"
                  >
                    {circleBeansLoading ? 'Checking Beans...' : 'Redeem Circle Beans with Email'}
                  </button>
                ) : circleBeansBalance > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#504442]">
                      Available: <strong>{circleBeansBalance} Beans</strong> (Worth ₹{Math.round((circleBeansBalance / 100) * 50)} off).
                    </p>
                    {circleBeansRedeemed > 0 ? (
                      <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        <span>Redeemed {circleBeansRedeemed} Beans (-₹{beansDiscount})</span>
                        <button
                          type="button"
                          onClick={() => setCircleBeansRedeemed(0)}
                          className="text-[11px] text-rose-700 underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyBeans(circleBeansBalance)}
                        className="w-full py-2 px-3 rounded-lg bg-[#271310] hover:bg-[#3d201c] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Apply Beans to Order
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#827472]">
                    No Beans found for this email. Complete an order to begin earning Beans!
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
                {beansDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Cà Phê Circle Beans</span>
                    <span>-{formatPrice(beansDiscount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#271310] pt-3 border-t border-[#f4ecea]">
                  <span>Total Amount</span>
                  <span className="font-serif text-xl text-[#785a00]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {formatPrice(finalTotalINR, currency)}
                  </span>
                </div>
                <p className="text-[10px] text-[#827472] text-center pt-2">
                  All prices are inclusive of applicable Goods & Services Tax (GST).
                </p>
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
                  <span>Authentic Vietnamese Origin Guarantee</span>
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
