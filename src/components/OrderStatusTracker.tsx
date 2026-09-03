import React, { useState, useEffect } from 'react';
import { PlacedOrder, OrderState, Currency } from '../types';
import { formatPrice } from '../utils/formatCurrency';
import {
  X,
  Clock,
  CheckCircle,
  Truck,
  Package,
  Search,
  Flame,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Box,
  Mail
} from 'lucide-react';

interface OrderStatusTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: PlacedOrder[];
  currency: Currency;
  initialOrderId?: string;
  onStatusChange?: (orderId: string, newStatus: OrderState) => void;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  isOpen,
  onClose,
  orders,
  currency,
  initialOrderId,
  onStatusChange,
}) => {
  if (!isOpen) return null;

  const [searchId, setSearchId] = useState(
    initialOrderId || (orders[0]?.orderId ?? '')
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderId || (orders[0]?.orderId ?? '')
  );

  const currentOrder = orders.find(
    (o) => o.orderId.toLowerCase() === selectedOrderId.toLowerCase()
  ) || orders[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSelectedOrderId(searchId.trim().toUpperCase());
    }
  };

  const stages: {
    state: OrderState;
    label: string;
    description: string;
    icon: typeof Flame;
  }[] = [
    {
      state: 'Order Placed & Roasting',
      label: 'Batch Roasting',
      description: 'Single-origin beans freshly drum-roasted in small batches.',
      icon: Flame,
    },
    {
      state: 'Packaged & Sealed',
      label: 'Ground & Nitrogen Sealed',
      description: 'Precision ground to spec and sealed in one-way degassing valve pouches.',
      icon: Package,
    },
    {
      state: 'In Transit',
      label: 'Dispatched in Express Transit',
      description: 'Handed over to air courier; heading to your regional delivery hub.',
      icon: Truck,
    },
    {
      state: 'Delivered',
      label: 'Delivered to Doorstep',
      description: 'Package delivered safely. Ready for your authentic home Phin brew!',
      icon: CheckCircle,
    },
  ];

  const currentStageIndex = currentOrder ? stages.findIndex((s) => s.state === currentOrder.status) : -1;

  return (
    <div
      id="order-tracker-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="order-tracker-modal"
        className="bg-[#faf2f0] border border-[#d3c3c0] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs text-[#271310] my-4"
        role="dialog"
      >
        {/* Tracker Header */}
        <div className="bg-[#271310] text-[#f4eceb] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#feca4d]" />
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Live Coffee Dispatch & Courier Tracker
              </h3>
              <p className="text-[11px] text-[#feca4d]">Real-time roastery and shipping updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#d3c3c0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Active Orders Bar */}
        <div className="p-4 bg-white border-b border-[#d3c3c0]/40 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827472]" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. CP-849201)..."
                className="w-full bg-[#faf2f0] border border-[#d3c3c0] rounded-lg pl-9 pr-3 py-1.5 font-mono text-xs text-[#271310] focus:outline-none focus:border-[#785a00]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#271310] text-white font-bold hover:bg-[#3d201c] transition-colors"
            >
              Track
            </button>
          </form>

          {/* Quick Select Buttons */}
          {orders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-[#827472] flex-shrink-0">
                Recent Orders:
              </span>
              {orders.map((ord) => (
                <button
                  key={ord.orderId}
                  onClick={() => {
                    setSelectedOrderId(ord.orderId);
                    setSearchId(ord.orderId);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                    selectedOrderId === ord.orderId
                      ? 'bg-[#785a00] text-white shadow-2xs'
                      : 'bg-[#faf2f0] border border-[#d3c3c0] text-[#504442] hover:bg-[#eee3e1]'
                  }`}
                >
                  {ord.orderId} ({ord.status.split(' ')[0]})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content View */}
        {!currentOrder ? (
          <div className="p-8 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#f4ecea] flex items-center justify-center text-[#785a00] mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="font-serif font-bold text-base text-[#271310]">No Orders In Tracker</h4>
              <p className="text-xs text-[#504442] leading-relaxed">
                You haven't placed an order yet in this session. Once you checkout, your package packaging and courier tracking updates will be displayed here in real time.
              </p>
            </div>

            {/* Email contact block */}
            <div className="p-3.5 bg-white rounded-xl border border-[#d3c3c0]/60 max-w-md w-full text-left space-y-1 text-xs shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-[#785a00]">
                <Mail className="w-4 h-4" />
                <span>Order Desk & Customer Fulfillment</span>
              </div>
              <p className="text-[11px] text-[#504442]">
                All order updates and tracking support are managed directly at:
              </p>
              <a
                href="mailto:Mritunjay.Bhardwaj@caphevietnam.in"
                className="inline-block text-[#271310] font-mono font-semibold underline hover:text-[#785a00]"
              >
                Mritunjay.Bhardwaj@caphevietnam.in
              </a>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#785a00] hover:bg-[#8e6b00] text-white font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer"
            >
              Browse Coffee Collection
            </button>
          </div>
        ) : (
          /* Scrollable Order Details & Stage Tracker */
          <div className="p-5 space-y-6 overflow-y-auto flex-1">
            {/* Order Header Summary */}
            <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#827472] block">
                  Tracking Order
                </span>
                <h4 className="text-lg font-bold font-mono text-[#785a00]">{currentOrder.orderId}</h4>
                <p className="text-[11px] text-[#504442]">
                  Recipient: <strong className="text-[#271310]">{currentOrder.customerName}</strong> •{' '}
                  {currentOrder.customerPhone}
                </p>
                <p className="text-[11px] text-[#504442]">
                  Payment: <strong className="text-[#271310]">{currentOrder.paymentMethod || 'Online'}</strong> •{' '}
                  <span className={currentOrder.paymentStatus?.includes('COD') || currentOrder.paymentStatus === 'pending' ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                    {currentOrder.paymentStatus || 'Paid'}
                  </span>
                </p>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f4ecea]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#827472] block">
                  Current Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#feca4d]/20 text-[#785a00] border border-[#feca4d]/40">
                  <span className="w-2 h-2 rounded-full bg-[#785a00] animate-pulse" />
                  {currentOrder.status}
                </span>
                {currentOrder.trackingNumber && (
                  <p className="text-[10px] text-[#827472] mt-1 font-mono">
                    AWB: {currentOrder.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-white p-5 rounded-xl border border-[#d3c3c0]/60 space-y-4">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#271310]">
                Fulfillment & Dispatch Milestones
              </h5>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d3c3c0]">
                {stages.map((stg, idx) => {
                  const Icon = stg.icon;
                  const isPassed = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stg.state} className="relative flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center -ml-6 border-2 transition-colors ${
                          isCurrent
                            ? 'bg-[#785a00] border-white text-white shadow-sm ring-2 ring-[#feca4d]'
                            : isPassed
                            ? 'bg-emerald-700 border-white text-white'
                            : 'bg-[#faf2f0] border-[#d3c3c0] text-[#827472]'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h6
                            className={`text-xs font-bold font-serif ${
                              isCurrent
                                ? 'text-[#785a00]'
                                : isPassed
                                ? 'text-[#271310]'
                                : 'text-[#827472]'
                            }`}
                          >
                            {stg.label}
                          </h6>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold text-[#785a00] bg-[#feca4d]/20 px-2 py-0.2 rounded">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#504442] mt-0.5">{stg.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Status State Simulation Controls (for interactive preview) */}
              {onStatusChange && (
                <div className="pt-4 border-t border-[#f4ecea] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#827472] block">
                    Simulate Roastery & Courier Progress:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {stages.map((stg) => (
                      <button
                        key={stg.state}
                        onClick={() => onStatusChange(currentOrder.orderId, stg.state)}
                        className={`px-2 py-1.5 rounded-md text-[10px] font-semibold border transition-all text-center ${
                          currentOrder.status === stg.state
                            ? 'bg-[#271310] text-white border-[#271310]'
                            : 'bg-[#faf2f0] border-[#d3c3c0] text-[#504442] hover:bg-[#eee3e1]'
                        }`}
                      >
                        {stg.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Address & Package Contents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#785a00] font-bold text-xs uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Shipping Address</span>
                </div>
                <p className="font-bold text-xs text-[#271310]">{currentOrder.customerName}</p>
                <p className="text-xs text-[#504442]">
                  {currentOrder.shippingAddress}, {currentOrder.cityPincode}
                </p>
                <p className="text-[11px] text-[#827472]">Contact: {currentOrder.customerPhone}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#d3c3c0]/60 space-y-2">
                <div className="flex items-center justify-between text-[#785a00] font-bold text-xs uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    <span>Package Contents</span>
                  </div>
                  <span className="text-[10px] text-[#827472]">({currentOrder.items.length} items)</span>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {currentOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-[11px]">
                      <span className="text-[#271310] truncate max-w-[170px]">
                        {it.quantity}x {it.name} ({it.selectedSize})
                      </span>
                      <span className="font-bold text-[#785a00]">
                        {formatPrice(it.unitPriceINR * it.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roastery Desk Updates Notice */}
            <div className="bg-white p-3 rounded-xl border border-[#d3c3c0]/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#504442]">
                <Mail className="w-4 h-4 text-[#785a00] flex-shrink-0" />
                <span>
                  Order updates & delivery support:{' '}
                  <strong className="text-[#271310] font-mono">Mritunjay.Bhardwaj@caphevietnam.in</strong>
                </span>
              </div>
              <a
                href="mailto:Mritunjay.Bhardwaj@caphevietnam.in"
                className="text-[#785a00] underline font-semibold text-[11px] hover:text-[#271310] flex-shrink-0"
              >
                Email Support
              </a>
            </div>
          </div>
        )}

        {/* Tracker Footer */}
        <div className="bg-[#f4ecea] p-4 border-t border-[#d3c3c0] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#504442]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Direct-Trade Freshness & Sealed Foil Guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#271310] hover:bg-[#3d201c] text-white font-bold text-xs uppercase transition-colors"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
