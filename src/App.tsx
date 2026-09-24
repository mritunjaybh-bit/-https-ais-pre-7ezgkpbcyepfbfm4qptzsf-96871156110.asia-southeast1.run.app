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
  ProductCategory,
  BlogPost
} from './types';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalogSection } from './components/ProductCatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PhinBrewStudio } from './components/PhinBrewStudio';
import { FlavorMatcher } from './components/FlavorMatcher';
import { HeritageStory } from './components/HeritageStory';
import { BlogListingPage } from './components/BlogListingPage';
import { BlogPostPage } from './components/BlogPostPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OnePageCheckout } from './components/OnePageCheckout';
import { TrackOrderPage } from './components/TrackOrderPage';
import { AdminPortal } from './components/AdminPortal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { Footer } from './components/Footer';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { CoffeeMasterChat } from './components/CoffeeMasterChat';
import { MusicProvider } from './context/MusicContext';
import { CheckCircle2, X } from 'lucide-react';
import { getAllOrders, saveOrder, updateOrderStatus as updateStoredOrderStatus } from './utils/orderStorage';
import { getBlogPostBySlug } from './data/blogPosts';
import { getProductById } from './data/coffeeData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('shop');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  // Initial cart starts empty
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [trackingContact, setTrackingContact] = useState<string | undefined>(undefined);
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
    handleSelectTab('checkout');
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

    if (details.emailSentSuccess !== false) {
      setEmailAlert({
        show: true,
        orderId,
        customerEmail: details.customerEmail,
      });
    }
  };

  // Tab navigation handler with URL pushState
  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    try {
      if (tab === 'checkout') {
        window.history.pushState({}, '', '/checkout');
      } else if (tab === 'track-order') {
        window.history.pushState({}, '', '/track');
      } else if (tab === 'admin') {
        window.history.pushState({}, '', '/mritunjay-admin-orders');
      } else if (tab === 'blog') {
        setSelectedBlogPost(null);
        window.history.pushState({}, '', '/blog');
      } else if (tab === 'flavoured') {
        window.history.pushState({}, '', '/flavoured');
      } else if (tab === 'instant') {
        window.history.pushState({}, '', '/instant');
      } else if (tab === 'brew-studio') {
        window.history.pushState({}, '', '/brew-studio');
      } else if (tab === 'flavor-matcher') {
        window.history.pushState({}, '', '/taste-matcher');
      } else if (tab === 'heritage') {
        window.history.pushState({}, '', '/heritage');
      } else if (tab === 'product-detail' && selectedProduct) {
        window.history.pushState({}, '', `/product/${selectedProduct.id}`);
      } else {
        window.history.pushState({}, '', '/');
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Dedicated product page navigation with clean URL
  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setActiveTab('product-detail');
    try {
      window.history.pushState({}, '', `/product/${product.id}`);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Dedicated blog post navigation with clean slug URL
  const handleSelectBlogPost = (post: BlogPost) => {
    setSelectedBlogPost(post);
    setActiveTab('blog-post');
    try {
      window.history.pushState({}, '', `/blog/${post.slug}`);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to browser URL routing (e.g. /mritunjay-admin-orders, /product/{id}, /checkout, /blog, /blog/{slug}, /instant, /brew-studio, /taste-matcher, /heritage, /order/{order_id}, /track)
  useEffect(() => {
    const handleUrlRoute = () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const search = new URLSearchParams(window.location.search);
        let targetOrderId = search.get('order') || search.get('orderId');

        // Private unlisted URL for Roastery Owner Admin Portal
        if (path === '/mritunjay-admin-orders' || path.startsWith('/mritunjay-admin-orders')) {
          setActiveTab('admin');
          return;
        }

        // Dissuade random visitors trying /admin - redirect to home
        if (path === '/admin' || path.startsWith('/admin')) {
          setActiveTab('shop');
          window.history.replaceState({}, '', '/');
          return;
        }

        // Dedicated product page route (/product/{id} or /item/{id})
        if (path.startsWith('/product/') || path.startsWith('/item/')) {
          const match = path.match(/^\/(?:product|item)\/([^/]+)/i);
          if (match && match[1]) {
            const prodId = decodeURIComponent(match[1]);
            const foundProduct = getProductById(prodId);
            if (foundProduct) {
              setSelectedProduct(foundProduct);
              setActiveTab('product-detail');
              return;
            }
          }
          // Fallback to shop if product not found
          setSelectedProduct(null);
          setActiveTab('shop');
          return;
        }

        // Shop Catalog Categories & Views
        if (path === '/instant' || path.startsWith('/instant')) {
          setActiveTab('instant');
          return;
        }

        if (path === '/flavoured' || path === '/flavored' || path.startsWith('/flavoured') || path.startsWith('/flavored')) {
          setActiveTab('flavoured');
          return;
        }

        if (path === '/brew-studio' || path === '/brew' || path.startsWith('/brew')) {
          setActiveTab('brew-studio');
          return;
        }

        if (path === '/taste-matcher' || path === '/flavor-matcher' || path === '/matcher' || path.startsWith('/taste-matcher') || path.startsWith('/flavor-matcher')) {
          setActiveTab('flavor-matcher');
          return;
        }

        if (path === '/heritage' || path === '/origins' || path.startsWith('/heritage') || path.startsWith('/origins')) {
          setActiveTab('heritage');
          return;
        }

        if (path === '/checkout' || path.startsWith('/checkout')) {
          setActiveTab('checkout');
          return;
        }

        if (path === '/blog' || path === '/journal') {
          setSelectedBlogPost(null);
          setActiveTab('blog');
          return;
        }

        if (path.startsWith('/blog/') || path.startsWith('/journal/')) {
          const match = path.match(/^\/(?:blog|journal)\/([^/]+)/i);
          if (match && match[1]) {
            const slug = decodeURIComponent(match[1]);
            const foundPost = getBlogPostBySlug(slug);
            if (foundPost) {
              setSelectedBlogPost(foundPost);
              setActiveTab('blog-post');
              return;
            }
          }
          // Fallback to blog listing if slug not matched
          setSelectedBlogPost(null);
          setActiveTab('blog');
          return;
        }

        if (path === '/track' || path.startsWith('/track') || path.startsWith('/order')) {
          const match = path.match(/^\/(?:order|track)\/([^/]+)/i);
          if (match && match[1]) {
            targetOrderId = decodeURIComponent(match[1]);
          }
          if (targetOrderId) {
            setTrackingOrderId(targetOrderId);
          }
          setActiveTab('track-order');
          return;
        }

        const targetProductId = search.get('product') || search.get('item');
        if (targetProductId) {
          const found = getProductById(targetProductId);
          if (found) {
            setSelectedProduct(found);
            setActiveTab('product-detail');
            return;
          }
        }

        if (targetOrderId) {
          setTrackingOrderId(targetOrderId);
          setActiveTab('track-order');
        }
      } catch (e) {
        console.error('Error parsing route URL:', e);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  const handleTrackOrder = (orderId?: string, contact?: string) => {
    if (orderId) setTrackingOrderId(orderId);
    if (contact) setTrackingContact(contact);
    setActiveTab('track-order');
    try {
      if (orderId) {
        window.history.pushState({}, '', `/order/${encodeURIComponent(orderId)}`);
      } else {
        window.history.pushState({}, '', '/track');
      }
    } catch {
      // Ignore if pushState fails in preview sandbox
    }
  };

  // Update status (Admin / Roastery Owner only)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderState) => {
    updateStoredOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Dedicated, Pure Roastery Owner Portal Interface (100% separate from customer storefront)
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#180e0c] text-[#f5ebe6] w-full flex flex-col font-sans selection:bg-[#feca4d] selection:text-[#271310]">
        <AdminPortal
          currency={currency}
          onBackToShop={() => handleSelectTab('shop')}
          onOrderUpdated={handleUpdateOrderStatus}
        />
      </div>
    );
  }

  return (
    <MusicProvider>
      <div className="min-h-screen flex flex-col bg-[#fff8f6] text-[#271310] w-full max-w-full overflow-x-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={handleSelectTab}
          currency={currency}
          setCurrency={setCurrency}
          cartCount={cartCount}
          cartTotalINR={cartTotalINR}
          onOpenCart={() => handleSelectTab('checkout')}
          onOpenMatcher={() => handleSelectTab('flavor-matcher')}
          onOpenTracker={() => handleTrackOrder()}
          activeOrdersCount={activeOrdersCount}
        />

      {/* On-Page Success Banner: Customer-Friendly Confirmation */}
      {emailAlert?.show && (
        <div className="bg-emerald-800 text-white px-4 py-3 border-b border-emerald-900 shadow-md relative z-30 transition-all w-full max-w-full overflow-hidden">
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
                onClick={() => handleTrackOrder(emailAlert.orderId, emailAlert.customerEmail)}
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
            onSelectTab={handleSelectTab}
            onOpenMatcher={() => handleSelectTab('flavor-matcher')}
          />
        )}

        {/* Tab 1: Shop All Coffee Powders & Instant */}
        {activeTab === 'shop' && (
          <ProductCatalogSection
            currency={currency}
            onOpenProductModal={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Tab 2: Flavoured Vietnamese Coffees (Egg, Chocolate, Coconut, etc.) */}
        {activeTab === 'flavoured' && (
          <ProductCatalogSection
            currency={currency}
            initialCategory="flavoured-coffee"
            onOpenProductModal={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Tab 3: Instant Coffee Category Focused View */}
        {activeTab === 'instant' && (
          <ProductCatalogSection
            currency={currency}
            initialCategory="instant-coffee"
            onOpenProductModal={handleSelectProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Dedicated Product Detail Page */}
        {activeTab === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            currency={currency}
            onAddToCart={handleAddToCart}
            onBuyNow={(cartItem) => {
              handleAddToCart(cartItem);
              handleSelectTab('checkout');
            }}
            onBackToShop={() => handleSelectTab('shop')}
            onSelectRelatedProduct={handleSelectProduct}
          />
        )}

        {/* Tab 4: Interactive Phin Brewing Studio */}
        {activeTab === 'brew-studio' && (
          <PhinBrewStudio
            currency={currency}
            onAddToCart={handleAddToCart}
            onOpenProductModal={handleSelectProduct}
          />
        )}

        {/* Tab 5: Taste Matcher Quiz */}
        {activeTab === 'flavor-matcher' && (
          <FlavorMatcher
            currency={currency}
            onOpenProductModal={handleSelectProduct}
            onQuickAddToCart={handleQuickAddProduct}
          />
        )}

        {/* Tab 6: Origin Heritage, Brewing Guides & Direct Trade */}
        {activeTab === 'heritage' && (
          <HeritageStory
            currency={currency}
            onAddToCart={handleAddToCart}
            onOpenProductModal={handleSelectProduct}
          />
        )}

        {/* Tab 7: The Cà Phê Journal - Blog Articles Listing */}
        {activeTab === 'blog' && (
          <BlogListingPage
            onSelectPost={handleSelectBlogPost}
            onNavigateToShop={() => handleSelectTab('shop')}
          />
        )}

        {/* Tab 8: Individual Blog Post Page Template */}
        {activeTab === 'blog-post' && selectedBlogPost && (
          <BlogPostPage
            post={selectedBlogPost}
            onBackToBlog={() => handleSelectTab('blog')}
            onNavigateToShop={() => handleSelectTab('shop')}
            onSelectRelatedPost={handleSelectBlogPost}
          />
        )}

        {/* Tab 9: Continuous One-Page Checkout */}
        {activeTab === 'checkout' && (
          <OnePageCheckout
            items={cartItems}
            currency={currency}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onBackToShop={() => handleSelectTab('shop')}
            onOrderPlaced={handleCheckout}
          />
        )}

        {/* Tab 8: Customer Read-Only Tracking Page (Requires Order ID + Contact Verification) */}
        {activeTab === 'track-order' && (
          <TrackOrderPage
            currency={currency}
            initialOrderId={trackingOrderId}
            initialContact={trackingContact}
            onBackToShop={() => handleSelectTab('shop')}
          />
        )}
      </main>

      {/* Product Detail & Grind/Size Selector Modal (Only active if not on dedicated product-detail page) */}
      {activeTab !== 'product-detail' && (
        <ProductDetailModal
          item={selectedProduct}
          currency={currency}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        orderDetails={confirmedOrder}
        currency={currency}
        onTrackOrder={(orderId, contact) => {
          handleTrackOrder(orderId, contact);
        }}
      />

      {/* Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenTracker={() => handleTrackOrder()}
      />

      {/* Traditional Vietnamese Ambient Background Music Player */}
      <BackgroundMusicPlayer />

      {/* AI Shopping Assistant: Coffee Master */}
      {activeTab !== 'admin' && (
        <CoffeeMasterChat
          currency={currency}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  </MusicProvider>
  );
}
