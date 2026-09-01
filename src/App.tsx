/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shop');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Initial cart with packaged coffee powder & instant sachets
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'init-powder-1',
      productId: 'saigon-heritage-phin-powder',
      name: 'Saigon Heritage Phin Coffee Powder',
      vietnameseName: 'Cà Phê Bột Phin Truyền Thống Sài Gòn',
      unitPriceINR: 380,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
      selectedSize: '250g Valve Pouch',
      selectedGrind: 'Authentic Phin Grind (Coarse)',
      category: 'coffee-powder',
    },
    {
      id: 'init-instant-2',
      productId: 'saigon-3in1-instant-sachets',
      name: 'Saigon 3-in-1 Condensed Milk Instant Coffee',
      vietnameseName: 'Cà Phê Hòa Tan 3in1 Sữa Đặc Sài Gòn',
      unitPriceINR: 340,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      selectedSize: 'Box of 20 Sachets',
      category: 'instant-coffee',
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
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
    shippingType: 'standard' | 'express' | 'same-day';
    shippingAddress: string;
    cityPincode: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    giftMessage?: string;
    discountINR: number;
    finalTotalINR: number;
  }) => {
    const orderId = `CP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPlacedOrder: PlacedOrder = {
      orderId,
      ...details,
      items: [...cartItems],
      createdAt: Date.now(),
      status: 'Order Placed & Roasting',
      courierPartner: details.shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface',
      trackingNumber: `BD-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    setOrders((prev) => [newPlacedOrder, ...prev]);
    setConfirmedOrder({
      orderId,
      ...details,
      items: [...cartItems],
    });
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Update status from Tracker
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderState) => {
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
          setTrackingOrderId(confirmedOrder?.orderId || (orders[0]?.orderId ?? undefined));
          setIsTrackerOpen(true);
        }}
        activeOrdersCount={activeOrdersCount}
      />

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
          setTrackingOrderId(orderId);
          setIsTrackerOpen(true);
        }}
      />

      {/* Real-time Courier & Roastery Status Tracker Component */}
      <OrderStatusTracker
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orders={orders}
        currency={currency}
        initialOrderId={trackingOrderId}
        onStatusChange={handleUpdateOrderStatus}
      />

      {/* Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenTracker={() => {
          setTrackingOrderId(confirmedOrder?.orderId || (orders[0]?.orderId ?? undefined));
          setIsTrackerOpen(true);
        }}
      />
    </div>
  );
}
