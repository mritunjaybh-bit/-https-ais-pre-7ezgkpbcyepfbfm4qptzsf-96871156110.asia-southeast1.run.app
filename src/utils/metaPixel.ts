/**
 * Meta (Facebook) Pixel Event Tracking Utility
 * 
 * Tracks standard e-commerce events:
 * - PageView: Fires on page/tab view changes
 * - AddToCart: Fires when a coffee or brewing item is added to the cart
 * - InitiateCheckout: Fires when a customer proceeds to checkout
 * - Purchase: Fires when an order is successfully completed (with value, currency, orderId)
 * 
 * Replace 'YOUR_PIXEL_ID_HERE' with your actual Meta Pixel ID in index.html and optionally here.
 */

export const META_PIXEL_ID = 'YOUR_PIXEL_ID_HERE';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Generic safe wrapper for Meta Pixel fbq calls
 */
export function trackMetaPixelEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.fbq === 'function') {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`[Meta Pixel] Event tracked: ${eventName}`, params || '');
    } else {
      console.debug(`[Meta Pixel] fbq not loaded or pixel not initialized (${eventName})`);
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Failed to track ${eventName}:`, err);
  }
}

/**
 * Track PageView event
 */
export function trackPageView(pageName?: string): void {
  trackMetaPixelEvent('PageView', pageName ? { page_name: pageName } : undefined);
}

/**
 * Track AddToCart event
 * Standard Meta Pixel schema: content_ids, content_name, content_type, value, currency
 */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
  category?: string;
}): void {
  const value = Number(item.price || 0) * Number(item.quantity || 1);
  trackMetaPixelEvent('AddToCart', {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    content_category: item.category || 'Coffee',
    value: Number(value.toFixed(2)),
    currency: item.currency || 'INR',
    num_items: item.quantity || 1,
  });
}

/**
 * Track InitiateCheckout event
 * Standard Meta Pixel schema: content_ids, contents, value, currency, num_items
 */
export function trackInitiateCheckout(payload: {
  items: Array<{ id?: string; productId?: string; name: string; unitPriceINR?: number; quantity: number }>;
  total: number;
  currency?: string;
}): void {
  const contentIds = payload.items.map((i) => i.productId || i.id || '').filter(Boolean);
  const contents = payload.items.map((i) => ({
    id: i.productId || i.id,
    quantity: i.quantity,
    item_price: i.unitPriceINR,
  }));
  const numItems = payload.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  trackMetaPixelEvent('InitiateCheckout', {
    content_ids: contentIds,
    contents,
    content_type: 'product',
    value: Number(Number(payload.total || 0).toFixed(2)),
    currency: payload.currency || 'INR',
    num_items: numItems,
  });
}

/**
 * Track Purchase event
 * Standard Meta Pixel schema: content_ids, contents, content_type, value, currency, num_items, order_id
 */
export function trackPurchase(payload: {
  orderId: string;
  total: number;
  currency?: string;
  items?: Array<{ id?: string; productId?: string; name: string; unitPriceINR?: number; quantity: number }>;
}): void {
  const items = payload.items || [];
  const contentIds = items.map((i) => i.productId || i.id || '').filter(Boolean);
  const contents = items.map((i) => ({
    id: i.productId || i.id,
    quantity: i.quantity,
    item_price: i.unitPriceINR,
  }));
  const numItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  trackMetaPixelEvent('Purchase', {
    content_ids: contentIds.length > 0 ? contentIds : [payload.orderId],
    contents,
    content_type: 'product',
    value: Number(Number(payload.total || 0).toFixed(2)),
    currency: payload.currency || 'INR',
    num_items: numItems > 0 ? numItems : 1,
    order_id: payload.orderId,
  });
}
