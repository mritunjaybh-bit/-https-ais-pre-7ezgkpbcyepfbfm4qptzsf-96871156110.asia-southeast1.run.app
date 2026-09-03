/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Currency,
  ProductItem,
  CartItem,
  PlacedOrder,
  OrderState,
  ProductCategory
} from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalogSection } from './components/ProductCatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PhinBrewStudio } from './components/PhinBrewStudio';
import { FlavorMatcher } from './components/FlavorMatcher';
import { HeritageStory } from './components/HeritageStory';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderStatusTracker } from './components/OrderStatusTracker';
import { Footer } from './components/Footer';
import { CheckCircle2, MailCheck, X } from 'lucide-react';
import { getAllOrders, saveOrder, updateOrderStatus as updateStoredOrderStatus } from './utils/orderStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shop');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Initial cart starts empty
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<PlacedOrder[]>(() => getAllOrders());
  const [emailAlert, setEmailAlert] = useState<{
    show: boolean;
    orderId: string;
    customerEmail: string;
  } | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
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
    paymentStatus?: 'paid' | 'pending' | 'failed';
    paymentId?: string;
    paymentMethod?: string;
    emailSentSuccess?: boolean;
    emailMessage?: string;
  } | null>(null);

  // Cart total calculations
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalINR = cartItems.reduce((sum, item) => sum + item.unitPriceINR * item.quantity, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;

  // Add Item to Cart
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.selectedSize === newItem.selectedSize &&
          i.selectedGrind === newItem.selectedGrind
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  // Quick Add for product catalog
  const handleQuickAddProduct = (item: ProductItem) => {
    const defaultSizeObj = item.availableSizes[0];
    const defaultSize = defaultSizeObj ? defaultSizeObj.size : '250g Valve Pouch';
    const unitPrice = defaultSizeObj
      ? Math.round(item.basePriceINR * defaultSizeObj.priceMultiplier)
      : item.basePriceINR;
    const defaultGrind = item.availableGrinds ? item.availableGrinds[0] : undefined;

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      productId: item.id,
      name: item.name,
      vietnameseName: item.vietnameseName,
      unitPriceINR: unitPrice,
      quantity: 1,
      imageUrl: item.imageUrl,
      selectedSize: defaultSize,
      selectedGrind: defaultGrind,
      category: item.category,
    };
    handleAddToCart(cartItem);
    setIsCartOpen(true);
  };

  // Update Item Quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Checkout submission
  const handleCheckout = (details: {
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
  }) => {
    const orderId = details.orderId || `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPlacedOrder: PlacedOrder = {
      orderId,
      ...details,
      items: [...cartItems],
      createdAt: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'Order Placed & Roasting',
      courierPartner: details.shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface',
      trackingNumber: `BD-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentStatus: details.paymentStatus || 'paid',
      paymentId: details.paymentId,
      paymentMethod: details.paymentMethod || 'Razorpay Online (UPI/Cards)',
      emailSentSuccess: details.emailSentSuccess ?? true,
      emailMessage: details.emailMessage,
    };

    // Save order in persistent storage database
    saveOrder(newPlacedOrder);

    setOrders((prev) => [newPlacedOrder, ...prev.filter((o) => o.orderId !== orderId)]);
    setConfirmedOrder({
      orderId,
      ...details,
      items: [...cartItems],
      emailSentSuccess: details.emailSentSuccess ?? true,
      emailMessage: details.emailMessage,
    });
    setCartItems([]);
    setIsCartOpen(false);

    if (details.emailSentSuccess !== false) {
      setEmailAlert({
        show: true,
        orderId,
        customerEmail: details.customerEmail,
      });
    }
  };

  // Listen to browser URL routing (e.g. /order/{order_id}, /track/{order_id}, or ?order={order_id})
  useEffect(() => {
    const handleUrlRoute = () => {
      try {
        const path = window.location.pathname;
        const search = new URLSearchParams(window.location.search);
        let targetOrderId = search.get('order') || search.get('orderId');

        if (!targetOrderId) {
          const match = path.match(/^\/(?:order|track)\/([^/]+)/i);
          if (match && match[1]) {
            targetOrderId = decodeURIComponent(match[1]);
          }
        }

        if (targetOrderId) {
          setTrackingOrderId(targetOrderId);
          setIsTrackerOpen(true);
        }
      } catch (e) {
        console.error('Error parsing route URL:', e);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setIsTrackerOpen(true);
    try {
      window.history.pushState({}, '', `/order/${encodeURIComponent(orderId)}`);
    } catch {
      // Ignore if pushState fails in preview sandbox
    }
  };

  const handleCloseTracker = () => {
    setIsTrackerOpen(false);
    try {
      if (
        window.location.pathname.startsWith('/order/') ||
        window.location.pathname.startsWith('/track/')
      ) {
        window.history.pushState({}, '', '/');
      }
    } catch {
      // ignore
    }
  };

  // Update status from Tracker
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderState) => {
    updateStoredOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f6] text-[#271310]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cartCount}
        cartTotalINR={cartTotalINR}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMatcher={() => setActiveTab('flavor-matcher')}
        onOpenTracker={() => {
          handleTrackOrder(confirmedOrder?.orderId || (orders[0]?.orderId ?? ''));
        }}
        activeOrdersCount={activeOrdersCount}
      />

      {/* On-Page Success Banner: Customer-Friendly Confirmation */}
      {emailAlert?.show && (
        <div className="bg-emerald-800 text-white px-4 py-3 border-b border-emerald-900 shadow-md relative z-30 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0 text-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span>Your order has been placed successfully!</span>
                  <span className="bg-emerald-900/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-200">
                    {emailAlert.orderId}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-100">
                  A confirmation email with your order summary has been sent to <span className="underline font-mono">{emailAlert.customerEmail}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleTrackOrder(emailAlert.orderId)}
                className="text-[11px] font-bold bg-white text-emerald-900 px-3 py-1 rounded-md hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
              >
                Track Your Order
              </button>
              <button
                type="button"
                onClick={() => setEmailAlert(null)}
                className="text-emerald-300 hover:text-white p-1 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {/* Hero Banner displayed on Shop / Flavoured / Instant Tabs */}
        {(activeTab === 'shop' || activeTab === 'flavoured' || activeTab === 'instant') && (
          <HeroBanner
            onSelectTab={setActiveTab}
            onOpenMatcher={() => setActiveTab('flavor-matcher')}
          />
        )}

        {/* Tab 1: Shop All Coffee Powders & Instant */}
        {activeTab === 'shop' && (
          <ProductCatalogSection
            currency={currency}
            onOpenProductModal={(item) => setSelectedProduct(item)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Tab 2: Flavoured Vietnamese Coffees (Egg, Chocolate, Coconut, etc.) */}
        {activeTab === 'flavoured' && (
          <ProductCatalogSection
            currency={currency}
            initialCategory="flavoured-coffee"
            onOpenProductModal={(item) => setSelectedProduct(item)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Tab 3: Instant Coffee Category Focused View */}
        {activeTab === 'instant' && (
          <ProductCatalogSection
            currency={currency}
            initialCategory="instant-coffee"
            onOpenProductModal={(item) => setSelectedProduct(item)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Tab 3: Interactive Phin Brewing Studio */}
        {activeTab === 'brew-studio' && (
          <PhinBrewStudio
            currency={currency}
            onAddToCart={handleAddToCart}
            onOpenProductModal={(item) => setSelectedProduct(item)}
          />
        )}

        {/* Tab 4: Taste Matcher Quiz */}
        {activeTab === 'flavor-matcher' && (
          <FlavorMatcher
            currency={currency}
            onOpenProductModal={(item) => setSelectedProduct(item)}
            onQuickAddToCart={handleQuickAddProduct}
          />
        )}

        {/* Tab 5: Origin Heritage, Brewing Guides & Direct Trade */}
        {activeTab === 'heritage' && (
          <HeritageStory
            currency={currency}
            onAddToCart={handleAddToCart}
            onOpenProductModal={(item) => setSelectedProduct(item)}
          />
        )}
      </main>

      {/* Product Detail & Grind/Size Selector Modal */}
      <ProductDetailModal
        item={selectedProduct}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        orderDetails={confirmedOrder}
        currency={currency}
        onTrackOrder={(orderId) => {
          handleTrackOrder(orderId);
        }}
      />

      {/* Real-time Courier & Roastery Status Tracker Component */}
      <OrderStatusTracker
        isOpen={isTrackerOpen}
        onClose={handleCloseTracker}
        orders={orders}
        currency={currency}
        initialOrderId={trackingOrderId}
        onStatusChange={handleUpdateOrderStatus}
      />

      {/* Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenTracker={() => {
          handleTrackOrder(confirmedOrder?.orderId || (orders[0]?.orderId ?? ''));
        }}
      />
    </div>
  );
}
