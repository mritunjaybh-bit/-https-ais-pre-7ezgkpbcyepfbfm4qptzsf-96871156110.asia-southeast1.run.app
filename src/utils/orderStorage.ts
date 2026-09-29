import { PlacedOrder, OrderState } from '../types';

const STORAGE_KEY = 'caphe_vietnam_orders_database_v1';

/**
 * Order Storage Database Service
 * Persists orders with full item lists, customer details, payment IDs, and timestamps.
 */

export function getAllOrders(): PlacedOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return [];
  } catch (err) {
    console.error('Failed to load orders from storage database:', err);
    return [];
  }
}

export function saveOrder(order: PlacedOrder): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAllOrders();
    // Prevent duplicates
    const filtered = existing.filter(
      (o) => o.orderId.toLowerCase() !== order.orderId.toLowerCase()
    );
    const updated = [order, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log(`[OrderDB] Stored order ${order.orderId} in local storage.`);

    // Persist to server database asynchronously
    saveOrderAsync(order).catch((err) => {
      console.warn('[OrderDB] Background order sync deferred:', err);
    });
  } catch (err) {
    console.error('Failed to save order to storage database:', err);
  }
}

export async function saveOrderAsync(order: PlacedOrder): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const existing = getAllOrders();
    const filtered = existing.filter(
      (o) => o.orderId.toLowerCase() !== order.orderId.toLowerCase()
    );
    const updated = [order, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Attempt 1: Direct POST /api/orders
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        console.log(`[OrderDB] Order ${order.orderId} saved to server successfully via /api/orders.`);
        return true;
      }
    } catch (primaryErr) {
      console.warn('[OrderDB] Primary /api/orders POST failed, attempting admin fallback:', primaryErr);
    }

    // Attempt 2: Fallback POST /api/admin?action=save-order
    try {
      const fallbackRes = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-order',
          order,
        }),
      });

      if (fallbackRes.ok) {
        console.log(`[OrderDB] Order ${order.orderId} saved to server via /api/admin fallback.`);
        return true;
      }
    } catch (fallbackErr) {
      console.warn('[OrderDB] Admin fallback save also failed:', fallbackErr);
    }

    return false;
  } catch (err) {
    console.error('[OrderDB] Error in saveOrderAsync:', err);
    return false;
  }
}

export async function syncPendingLocalOrdersToServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const localOrders = getAllOrders();
    if (localOrders.length === 0) return;

    // Check server orders
    const res = await fetch('/api/orders');
    if (!res.ok) return;
    const data = await res.json();
    const serverOrders: PlacedOrder[] = Array.isArray(data.orders) ? data.orders : [];
    const serverIds = new Set(serverOrders.map((o) => o.orderId.toLowerCase()));

    // Find any local orders that aren't on the server yet
    for (const order of localOrders) {
      if (!serverIds.has(order.orderId.toLowerCase())) {
        console.log(`[OrderDB] Syncing local order ${order.orderId} to server database...`);
        await fetch('/api/orders', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });
      }
    }
  } catch (err) {
    console.warn('[OrderDB] Sync check skipped:', err);
  }
}

export function getOrderById(orderId: string): PlacedOrder | undefined {
  const orders = getAllOrders();
  return orders.find(
    (o) => o.orderId.toLowerCase() === orderId.trim().toLowerCase()
  );
}

export function updateOrderStatus(orderId: string, newStatus: OrderState): void {
  if (typeof window === 'undefined') return;
  try {
    const orders = getAllOrders();
    const index = orders.findIndex(
      (o) => o.orderId.toLowerCase() === orderId.trim().toLowerCase()
    );
    if (index !== -1) {
      orders[index].status = newStatus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      console.log(`[OrderDB] Order ${orderId} status updated to: ${newStatus}`);
    }
  } catch (err) {
    console.error('Failed to update order status in storage:', err);
  }
}

/**
 * Customer Access (View-Only, with Verification)
 * Verifies that BOTH Order ID AND contact detail (email or phone number) match
 * before returning the read-only order record.
 */
export function verifyAndGetOrder(orderId: string, contactInput: string): PlacedOrder | null {
  const cleanId = orderId.trim().toLowerCase();
  const cleanContact = contactInput.trim().toLowerCase();

  if (!cleanId || !cleanContact) return null;

  const order = getOrderById(cleanId);
  if (!order) return null;

  // Check email match (case-insensitive)
  const storedEmail = (order.customerEmail || '').trim().toLowerCase();
  if (storedEmail && storedEmail === cleanContact) {
    return order;
  }

  // Check phone match (digits only comparison)
  const cleanInputDigits = cleanContact.replace(/[^0-9]/g, '');
  const storedPhoneDigits = (order.customerPhone || '').replace(/[^0-9]/g, '');

  if (cleanInputDigits && storedPhoneDigits) {
    if (
      storedPhoneDigits === cleanInputDigits ||
      (cleanInputDigits.length >= 10 && storedPhoneDigits.endsWith(cleanInputDigits)) ||
      (storedPhoneDigits.length >= 10 && cleanInputDigits.endsWith(storedPhoneDigits))
    ) {
      return order;
    }
  }

  return null;
}

export async function fetchOrderFromServer(
  orderId: string,
  contactInput: string
): Promise<PlacedOrder | null> {
  const local = verifyAndGetOrder(orderId, contactInput);
  if (local) return local;

  try {
    const res = await fetch(
      `/api/orders?orderId=${encodeURIComponent(orderId)}&contact=${encodeURIComponent(contactInput)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.order) {
        saveOrder(data.order);
        return data.order;
      }
    }
  } catch (err) {
    console.warn('[OrderDB] Server fetch failed:', err);
  }
  return null;
}

export function exportOrdersJSON(): string {
  const orders = getAllOrders();
  return JSON.stringify(orders, null, 2);
}
