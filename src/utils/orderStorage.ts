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
    console.log(`[OrderDB] Successfully stored order ${order.orderId} in database.`);
  } catch (err) {
    console.error('Failed to save order to storage database:', err);
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

export function exportOrdersJSON(): string {
  const orders = getAllOrders();
  return JSON.stringify(orders, null, 2);
}
