import React, { useEffect } from 'react';
import { Currency, CartItem } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import { Logo } from './Logo';
import { CheckCircle, Truck, Package, Sparkles, MapPin, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
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
            Order Confirmed • Roastery Notified
          </span>
          <h3
            className="text-2xl font-bold text-white font-serif"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Fresh Roasting & Packing
          </h3>
          <p className="text-xs text-[#f4eceb]/80 max-w-sm mx-auto">
            Your coffee powder and instant blends will be custom-ground, degassing-sealed, and dispatched to your door.
          </p>
        </div>

        {/* Order Identifier & Metadata Box */}
        <div className="bg-[#faf2f0] p-4 border-b border-[#d3c3c0]/50 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] uppercase text-[#827472] font-semibold block">Order Reference:</span>
            <span className="font-mono font-bold text-sm text-[#785a00]">{orderDetails.orderId}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[#827472] font-semibold block">Estimated Delivery:</span>
            <span className="font-bold text-xs text-[#271310]">
              {orderDetails.shippingType === 'express' ? '1 - 2 Business Days' : '3 - 5 Business Days'}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase text-[#827472] font-semibold block">Fulfillment Type:</span>
            <span className="font-bold text-xs text-emerald-800 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Air Express Courier
            </span>
          </div>
        </div>

        {/* Destination & Recipient */}
        <div className="p-4 bg-white border-b border-[#d3c3c0]/40 space-y-1">
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
          <p className="text-[11px] text-[#827472]">Tracking updates sent to: {orderDetails.customerEmail}</p>

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
            <span>Total Paid (Prepaid/COD):</span>
            <span className="font-serif text-base text-[#785a00]">
              {formatPrice(orderDetails.finalTotalINR, currency)}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#fff8f6] p-4 border-t border-[#d3c3c0]/50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg border border-[#d3c3c0] text-[#504442] hover:bg-white transition-colors flex items-center gap-1.5 font-semibold text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          {onTrackOrder && (
            <button
              onClick={() => {
                onTrackOrder(orderDetails.orderId);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#feca4d] hover:bg-[#ffda7a] text-[#271310] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-[#271310]" />
              <span>Track Shipping Status</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs uppercase tracking-wide transition-all shadow-xs text-center"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
