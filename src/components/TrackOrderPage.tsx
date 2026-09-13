import React, { useState, useEffect } from 'react';
import { Currency, PlacedOrder, OrderState } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { verifyAndGetOrder } from '../utils/orderStorage';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  XCircle,
  Coffee,
  Lock
} from 'lucide-react';

interface TrackOrderPageProps {
  currency: Currency;
  initialOrderId?: string;
  initialContact?: string;
  onBackToShop: () => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  currency,
  initialOrderId = '',
  initialContact = '',
  onBackToShop,
}) => {
  const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId);
  const [contactInput, setContactInput] = useState<string>(initialContact);
  const [verifiedOrder, setVerifiedOrder] = useState<PlacedOrder | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  // Auto-verify if initialOrderId and initialContact are supplied (e.g., directly from checkout)
  useEffect(() => {
    if (initialOrderId && initialContact) {
      const match = verifyAndGetOrder(initialOrderId, initialContact);
      if (match) {
        setVerifiedOrder(match);
        setHasSearched(true);
      }
    } else if (initialOrderId) {
      setOrderIdInput(initialOrderId);
    }
  }, [initialOrderId, initialContact]);

  const handleVerifyAndTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setHasSearched(true);

    const cleanId = orderIdInput.trim();
    const cleanContact = contactInput.trim();

    if (!cleanId || !cleanContact) {
      setSearchError('Please provide both your Order ID and contact details.');
      setVerifiedOrder(null);
      return;
    }

    const order = verifyAndGetOrder(cleanId, cleanContact);
    if (order) {
      setVerifiedOrder(order);
      setSearchError(null);
    } else {
      setVerifiedOrder(null);
      setSearchError("Order ID and contact details don't match — please check and try again.");
    }
  };

  const handleCopyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Helper to map order status into progressive step index
  const getStageIndex = (status: OrderState): number => {
    if (status === 'Cancelled') return -1;
    if (status === 'Delivered') return 3;
    if (status === 'In Transit') return 2;
    if (status === 'Confirmed' || status === 'Packaged & Sealed') return 1;
    return 0; // 'Order Placed' or 'Order Placed & Roasting'
  };

  const currentStageIndex = verifiedOrder ? getStageIndex(verifiedOrder.status) : 0;
  const isCancelled = verifiedOrder?.status === 'Cancelled';

  const stages: { label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Order Placed', sub: 'Received & Queued at Roastery', icon: Clock },
    { label: 'Confirmed', sub: 'Basalt Roast & Foil Degas Seal', icon: Package },
    { label: 'In Transit', sub: 'Dispatched via Air Courier', icon: Truck },
    { label: 'Delivered', sub: 'Delivered to Doorstep', icon: CheckCircle },
  ];

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d3c3c0]/60 pb-4">
        <div>
          <button
            type="button"
            onClick={onBackToShop}
            className="inline-flex items-center gap-1.5 text-xs text-[#785a00] hover:text-[#271310] font-semibold transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </button>
          <h1
            className="font-serif font-bold text-2xl sm:text-3xl text-[#271310]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Track Your Coffee Delivery
          </h1>
          <p className="text-xs text-[#504442] mt-0.5">
            Enter your Order ID and the email or phone number used during checkout to view real-time delivery status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#504442] bg-[#faf2f0] border border-[#d3c3c0] px-3 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>Verified Customer Access • Read-Only Tracking</span>
        </div>
      </div>

      {/* Verification Search Box */}
      <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-6 shadow-sm mb-8">
        <form onSubmit={handleVerifyAndTrack} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderIdInput" className="text-[11px] font-bold text-[#827472] uppercase block mb-1.5">
                Order ID *
              </label>
              <input
                id="orderIdInput"
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => {
                  setOrderIdInput(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                placeholder="e.g. CP-849201"
                className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-[#271310] placeholder:normal-case placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
              />
              <span className="text-[10px] text-[#827472] mt-1 block">
                Found in your order confirmation email or screen.
              </span>
            </div>

            <div>
              <label htmlFor="contactInput" className="text-[11px] font-bold text-[#827472] uppercase block mb-1.5">
                Email Address or Phone Number *
              </label>
              <input
                id="contactInput"
                type="text"
                required
                value={contactInput}
                onChange={(e) => {
                  setContactInput(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                placeholder="e.g. yourname@example.com or 9876543210"
                className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-xl px-3.5 py-2.5 text-xs text-[#271310] placeholder:text-[#a0918e] focus:outline-none focus:border-[#785a00] focus:ring-1 focus:ring-[#785a00]"
              />
              <span className="text-[10px] text-[#827472] mt-1 block">
                The exact contact detail entered during checkout.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-[#827472]">
              <Lock className="w-3.5 h-3.5 text-[#785a00]" />
              <span>Two-factor verification protects order privacy & shipping details.</span>
            </div>
            <button
              type="submit"
              id="verify-track-button"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#785a00] hover:bg-[#8e6b00] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Verify & Track Order</span>
            </button>
          </div>
        </form>

        {/* Verification Error Notice */}
        {searchError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{searchError}</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Double-check for any typos in the Order ID (e.g. CP-XXXXXX) or verify that you're using the exact email or phone number entered at checkout.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Verified Order Read-Only Details */}
      {verifiedOrder ? (
        <div className="space-y-6">
          {/* Main Status Card */}
          <div className="bg-white rounded-2xl border border-[#d3c3c0]/70 p-6 shadow-sm space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f4ecea] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#827472] uppercase tracking-wider block">
                  Verified Order Record
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h2 className="font-serif font-bold text-xl text-[#271310] font-mono">
                    {verifiedOrder.orderId}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : verifiedOrder.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-[#feca4d]/30 text-[#785a00] border border-[#feca4d]'
                    }`}
                  >
                    {verifiedOrder.status}
                  </span>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] text-[#827472] block">Order Placed On</span>
                <span className="text-xs font-semibold text-[#271310]">
                  {verifiedOrder.timestamp
                    ? new Date(verifiedOrder.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recently'}
                </span>
              </div>
            </div>

            {/* If Cancelled */}
            {isCancelled ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">This order has been cancelled</h3>
                  <p className="mt-1 text-[#504442]">
                    If a payment was captured online, your refund is automatically routed to your original payment source within 3-5 business days. Please contact support@caphevietnam.in for any questions.
                  </p>
                </div>
              </div>
            ) : (
              /* Progressive Delivery Timeline */
              <div className="py-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                  {stages.map((stg, idx) => {
                    const Icon = stg.icon;
                    const isCompleted = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div
                        key={stg.label}
                        className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-[#271310] text-white border-[#271310] shadow-md ring-2 ring-[#785a00]/40'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-[#faf2f0] text-[#827472] border-[#d3c3c0]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isCurrent
                                ? 'bg-[#feca4d] text-[#271310]'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#e5dcd9] text-[#827472]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-white/20 text-white'
                                : isCompleted
                                ? 'bg-emerald-200/80 text-emerald-900'
                                : 'bg-transparent text-[#827472]'
                            }`}
                          >
                            {isCurrent ? 'Active' : isCompleted ? 'Completed' : `Step ${idx + 1}`}
                          </span>
                        </div>

                        <div>
                          <p
                            className={`font-serif font-bold text-xs ${
                              isCurrent ? 'text-white' : isCompleted ? 'text-emerald-950' : 'text-[#504442]'
                            }`}
                          >
                            {stg.label}
                          </p>
                          <p
                            className={`text-[10px] mt-0.5 leading-snug ${
                              isCurrent ? 'text-[#e5dcd9]' : isCompleted ? 'text-emerald-800' : 'text-[#827472]'
                            }`}
                          >
                            {stg.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courier Dispatch & Air Waybill Info */}
            <div className="bg-[#faf2f0] rounded-xl p-4 border border-[#d3c3c0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#271310] text-[#feca4d] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#827472] uppercase font-bold block">Courier Partner & Dispatch</span>
                  <p className="text-xs font-bold text-[#271310]">
                    {verifiedOrder.courierPartner || (verifiedOrder.shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface')}
                  </p>
                  <p className="text-[11px] font-mono text-[#785a00]">
                    AWB Tracking: {verifiedOrder.trackingNumber || 'Pending Courier Scan'}
                  </p>
                </div>
              </div>

              {verifiedOrder.trackingNumber && (
                <button
                  type="button"
                  onClick={() => handleCopyTrackingNumber(verifiedOrder.trackingNumber!)}
                  className="px-3 py-1.5 rounded-lg border border-[#d3c3c0] bg-white hover:bg-[#eee3e1] text-[#271310] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedTracking ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#827472]" />
                      <span>Copy Tracking AWB</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Delivery Address & Package Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Shipping Address */}
              <div className="bg-[#faf2f0]/60 p-4 rounded-xl border border-[#d3c3c0]/60 space-y-2">
                <div className="flex items-center gap-1.5 text-[#785a00] font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Destination Address</span>
                </div>
                <p className="font-bold text-xs text-[#271310]">{verifiedOrder.customerName}</p>
                <p className="text-xs text-[#504442] leading-relaxed">
                  {verifiedOrder.shippingAddress}, {verifiedOrder.cityPincode}
                </p>
                <div className="text-[11px] text-[#827472] pt-1 space-y-0.5">
                  <p>Contact Phone: {verifiedOrder.customerPhone}</p>
                  <p>Confirmation Email: {verifiedOrder.customerEmail}</p>
                </div>
                {verifiedOrder.giftMessage && (
                  <div className="mt-2 p-2 rounded bg-white border border-[#d3c3c0] text-[11px] text-[#785a00] italic">
                    " {verifiedOrder.giftMessage} "
                  </div>
                )}
              </div>

              {/* Package Items & Payment */}
              <div className="bg-[#faf2f0]/60 p-4 rounded-xl border border-[#d3c3c0]/60 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[#785a00] font-bold text-xs uppercase tracking-wider pb-1">
                    <div className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Package Items</span>
                    </div>
                    <span className="text-[10px] text-[#827472]">({verifiedOrder.items?.length || 0} items)</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {verifiedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-[#f4ecea] last:border-0">
                        <div className="min-w-0 pr-2">
                          <span className="text-[#271310] font-medium block truncate">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-[10px] text-[#827472] block">
                            {item.selectedSize} {item.selectedGrind ? `• ${item.selectedGrind}` : ''}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#785a00] text-xs whitespace-nowrap">
                          {formatPrice(item.unitPriceINR * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#d3c3c0] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#827472] block">Payment Method</span>
                    <span className="font-semibold text-[#271310]">{verifiedOrder.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#827472] block">Total Amount</span>
                    <span className="font-serif font-bold text-sm text-[#785a00]">
                      {formatPrice(verifiedOrder.finalTotalINR, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Desk Notice */}
            <div className="bg-white p-3.5 rounded-xl border border-[#d3c3c0]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#504442]">
                <Mail className="w-4 h-4 text-[#785a00] flex-shrink-0" />
                <span>
                  Questions about courier delivery or roast dates? Contact{' '}
                  <strong className="text-[#271310] font-medium">support@caphevietnam.in</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVerifiedOrder(null);
                  setOrderIdInput('');
                  setContactInput('');
                  setHasSearched(false);
                }}
                className="text-[#785a00] hover:text-[#271310] font-semibold text-xs underline cursor-pointer self-end sm:self-auto"
              >
                Track Another Order
              </button>
            </div>
          </div>
        </div>
      ) : hasSearched && !searchError ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-[#d3c3c0]/70 p-6 space-y-3">
          <Package className="w-10 h-10 text-[#827472] mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#271310]">No Order Record Found</h3>
          <p className="text-xs text-[#504442] max-w-sm mx-auto">
            Please make sure both the Order ID and contact details match the details provided during order checkout.
          </p>
        </div>
      ) : null}
    </div>
  );
};
