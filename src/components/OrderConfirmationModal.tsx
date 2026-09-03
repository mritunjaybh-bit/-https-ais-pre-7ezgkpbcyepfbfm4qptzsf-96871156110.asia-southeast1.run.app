import React, { useState, useEffect } from 'react';
import { Currency, CartItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { Logo } from './Logo';
import {
  CheckCircle,
  Truck,
  Package,
  Sparkles,
  MapPin,
  Printer,
  ArrowRight,
  ShieldCheck,
  Mail,
  Copy,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    orderId: string;
    shippingType: 'standard' | 'express' | 'same-day';
    shippingAddress: string;
    cityPincode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    giftMessage?: string;
    discountINR: number;
    finalTotalINR: number;
    items: CartItem[];
    paymentStatus?: 'paid' | 'pending' | 'Pending (COD)' | 'failed' | string;
    paymentId?: string;
    paymentMethod?: string;
    emailSentSuccess?: boolean;
    emailMessage?: string;
  } | null;
  currency: Currency;
  onTrackOrder?: (orderId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
  currency,
  onTrackOrder,
}) => {
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#feca4d', '#785a00', '#271310', '#081c17']
      });
    }
  }, [isOpen]);

  if (!isOpen || !orderDetails) return null;

  const trackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/order/${orderDetails.orderId}`;

  const handleCopyOrderId = () => {
    navigator.clipboard?.writeText(orderDetails.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyTrackingLink = () => {
    navigator.clipboard?.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTrackClick = () => {
    if (onTrackOrder) {
      onTrackOrder(orderDetails.orderId);
    }
    onClose();
  };

  return (
    <div
      id="order-confirmation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="order-confirmation-modal"
        className="bg-[#fff8f6] w-full max-w-lg rounded-2xl border border-[#d3c3c0]/60 shadow-2xl overflow-hidden my-6 text-xs text-[#271310]"
      >
        {/* Receipt Header Banner */}
        <div className="bg-[#271310] text-[#f4eceb] p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#785a00] text-white mx-auto flex items-center justify-center mb-2 shadow-inner">
            <CheckCircle className="w-7 h-7 text-[#feca4d]" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#feca4d] block">
            Order Confirmed
          </span>
          <h3
            className="text-2xl font-bold text-white font-serif"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Your order has been placed successfully!
          </h3>
          <p className="text-xs text-[#f4eceb]/80 max-w-sm mx-auto">
            Thank you for brewing with us! A confirmation email has been sent to{' '}
            <strong className="text-white font-mono">{orderDetails.customerEmail}</strong>.
          </p>
        </div>

        {/* Order Identifier & Timing Metadata Box */}
        <div className="bg-[#faf2f0] p-4 border-b border-[#d3c3c0]/50 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] uppercase text-[#827472] font-semibold block">Order ID:</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono font-bold text-sm text-[#785a00]">{orderDetails.orderId}</span>
              <button
                type="button"
                onClick={handleCopyOrderId}
                title="Copy Order ID"
                className="text-[#827472] hover:text-[#271310] p-0.5 rounded transition-colors cursor-pointer"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[#827472] font-semibold block">Estimated Delivery:</span>
            <span className="font-bold text-xs text-[#271310] block mt-0.5">
              {orderDetails.shippingType === 'express' ? '1 – 2 Business Days' : '3 – 5 Business Days'}
            </span>
            <span className="text-[10px] text-[#827472]">Fresh roasting in 24h</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-[#827472] font-semibold block">Fulfillment:</span>
            <span className="font-bold text-xs text-emerald-800 flex items-center gap-1 mt-0.5">
              <Truck className="w-3.5 h-3.5" />
              Air Express Courier
            </span>
            <span className="text-[10px] text-[#827472]">Nitrogen-sealed valve</span>
          </div>
        </div>

        {/* Customer-Friendly Order Tracking Card */}
        <div className="bg-[#f5ecea]/70 p-4 border-b border-[#d3c3c0]/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#271310] uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#785a00]" />
              Order Status & Live Progress
            </span>
            <span className="bg-[#785a00]/10 text-[#785a00] font-bold text-[10px] px-2 py-0.5 rounded-full">
              Order Placed
            </span>
          </div>

          {/* 4-Step Progress Mini-Bar */}
          <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-[#785a00]" />
              <span className="font-bold text-[#785a00] block text-[9px] leading-tight">Order Placed</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-[#d3c3c0]/60" />
              <span className="text-[#827472] block text-[9px] leading-tight">Preparing</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-[#d3c3c0]/60" />
              <span className="text-[#827472] block text-[9px] leading-tight">Out for Delivery</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-[#d3c3c0]/60" />
              <span className="text-[#827472] block text-[9px] leading-tight">Delivered</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <button
              type="button"
              id="track-order-button"
              onClick={handleTrackClick}
              className="px-3.5 py-2 rounded-lg bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Your Order</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handleCopyTrackingLink}
              className="text-[11px] text-[#504442] hover:text-[#271310] flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#d3c3c0]/70 bg-white transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tracking Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#827472]" />
                  <span>Copy Tracking Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Destination & Recipient */}
        <div className="p-4 bg-white border-b border-[#d3c3c0]/40 space-y-2">
          <div className="flex items-center gap-1.5 text-[#785a00] font-bold text-[11px] uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Shipping Destination</span>
          </div>
          <p className="font-bold text-xs text-[#271310]">
            {orderDetails.customerName} • {orderDetails.customerPhone}
          </p>
          <p className="text-xs text-[#504442]">
            {orderDetails.shippingAddress}, {orderDetails.cityPincode}
          </p>
          <p className="text-[11px] text-[#827472]">
            Tracking notifications will be delivered to: <span className="font-mono text-[#271310]">{orderDetails.customerEmail}</span>
          </p>

          {orderDetails.giftMessage && (
            <div className="mt-2 p-2.5 bg-[#faf2f0] rounded-lg border border-[#d3c3c0]/50 text-xs italic text-[#504442]">
              " {orderDetails.giftMessage} "
            </div>
          )}
        </div>

        {/* Items Summary Table */}
        <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] uppercase font-bold text-[#827472] border-b border-[#d3c3c0]/40 pb-1">
            <span>Product Details</span>
            <span>Subtotal</span>
          </div>
          {orderDetails.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-md bg-[#faf2f0] flex-shrink-0"
                />
                <div>
                  <p className="font-bold text-[#271310] font-serif">{item.name}</p>
                  <p className="text-[10px] text-[#785a00] italic">{item.selectedSize}</p>
                  {item.selectedGrind && (
                    <p className="text-[10px] text-[#504442]">{item.selectedGrind}</p>
                  )}
                  <span className="text-[10px] text-[#827472]">Qty: {item.quantity}</span>
                </div>
              </div>
              <span className="font-bold text-xs font-serif text-[#271310]">
                {formatPrice(item.unitPriceINR * item.quantity, currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="bg-[#faf2f0] p-4 border-t border-[#d3c3c0]/50 space-y-1.5 text-xs text-[#504442]">
          {orderDetails.discountINR > 0 && (
            <div className="flex justify-between text-emerald-800 font-semibold">
              <span>Applied Voucher Discount:</span>
              <span>-{formatPrice(orderDetails.discountINR, currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-[#271310] pt-1 border-t border-[#d3c3c0]/40">
            <span>
              {orderDetails.paymentMethod === 'COD'
                ? 'Amount Due on Delivery (COD):'
                : 'Total Paid (Razorpay Online):'}
            </span>
            <span className="font-serif text-base text-[#785a00]">
              {formatPrice(orderDetails.finalTotalINR, currency)}
            </span>
          </div>
          {orderDetails.paymentMethod === 'COD' ? (
            <div className="flex justify-between text-[11px] text-[#504442] pt-0.5">
              <span>Payment Status:</span>
              <span className="font-semibold text-[#785a00]">Pending (Collect on Delivery)</span>
            </div>
          ) : (
            orderDetails.paymentId && (
              <div className="flex justify-between text-[11px] text-[#504442] pt-0.5">
                <span>Razorpay Transaction ID:</span>
                <span className="font-mono text-[#785a00] font-semibold">{orderDetails.paymentId}</span>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#fff8f6] p-4 border-t border-[#d3c3c0]/50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg border border-[#d3c3c0] text-[#504442] hover:bg-white transition-colors flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          <button
            type="button"
            onClick={handleTrackClick}
            className="px-4 py-2 rounded-lg bg-[#feca4d] hover:bg-[#ffda7a] text-[#271310] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-[#271310]" />
            <span>Track Your Order</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg bg-[#271310] hover:bg-[#3d201c] text-white font-bold text-xs uppercase tracking-wide transition-all shadow-xs text-center cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
