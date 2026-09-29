import { Request, Response } from 'express';
import { getDbOrders, updateDbOrders, getDbProducts, updateDbProducts } from './_lib/db';
import { isValidSession } from './_lib/auth-util';
import { PlacedOrder, OrderState } from '../src/types';

export default async function handler(req: any, res: any) {
  return ordersHandler(req, res);
}

export function ordersHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  req.body = body || {};

  const orders = getDbOrders(true);
  const pathParts = (req.path || req.url || '').split('?')[0].split('/').filter(Boolean);
  const pathId = pathParts.length > 2 && pathParts[1] === 'orders' ? pathParts[2] : undefined;

  // 1. GET /api/orders (or single order tracking)
  if (req.method === 'GET') {
    const orderId = req.query.orderId || req.query.id || pathId;
    const contact = req.query.contact;

    if (orderId) {
      const target = orders.find(
        (o) => o.orderId.toLowerCase() === String(orderId).trim().toLowerCase()
      );

      if (!target) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If contact provided, verify customer access
      if (contact) {
        const cleanContact = String(contact).trim().toLowerCase().replace(/[\s-+()]/g, '');
        const emailMatch = target.customerEmail?.toLowerCase().includes(cleanContact);
        const phoneMatch = target.customerPhone?.replace(/[\s-+()]/g, '').includes(cleanContact);

        if (!emailMatch && !phoneMatch) {
          return res.status(403).json({ error: 'Verification failed for this order' });
        }
      }

      return res.status(200).json({ order: target });
    }

    // Admin listing orders
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    // Allow fetching orders if admin session valid or return active public list
    if (isValidSession(token)) {
      return res.status(200).json({ orders });
    }

    // If no token, return list for initial hydration
    return res.status(200).json({ orders });
  }

  // 2. PATCH or POST with action='update-status' -> Update status and tracking
  if (req.method === 'PATCH' || (req.method === 'POST' && req.body?.action === 'update-status')) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!isValidSession(token)) {
      return res.status(401).json({ error: 'Unauthorized: Admin session required' });
    }

    const orderId = req.body.orderId || req.query.id || pathId;
    const { status, trackingNumber, courierPartner } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    const index = orders.findIndex(
      (o) => o.orderId.toLowerCase() === String(orderId).trim().toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: `Order ${orderId} not found` });
    }

    if (status) {
      orders[index].status = status as OrderState;
    }
    if (trackingNumber !== undefined) {
      orders[index].trackingNumber = trackingNumber;
    }
    if (courierPartner !== undefined) {
      orders[index].courierPartner = courierPartner;
    }

    updateDbOrders(orders);

    return res.status(200).json({
      success: true,
      message: `Order ${orderId} updated`,
      order: orders[index],
    });
  }

  // 3. POST /api/orders - Record new placed order and decrement inventory
  if (req.method === 'POST') {
    const rawOrder = (req.body.order || req.body) as any;
    if (!rawOrder) {
      return res.status(400).json({ error: 'Order data required' });
    }

    const orderId = String(rawOrder.orderId || `CP-${Math.floor(100000 + Math.random() * 900000)}`).trim();
    const items = Array.isArray(rawOrder.items) ? rawOrder.items : [];

    const newOrder: PlacedOrder = {
      orderId,
      shippingType: rawOrder.shippingType || 'standard',
      shippingAddress: String(rawOrder.shippingAddress || ''),
      cityPincode: String(rawOrder.cityPincode || ''),
      customerName: String(rawOrder.customerName || 'Valued Customer'),
      customerPhone: String(rawOrder.customerPhone || ''),
      customerEmail: String(rawOrder.customerEmail || ''),
      giftMessage: rawOrder.giftMessage,
      discountINR: Number(rawOrder.discountINR) || 0,
      finalTotalINR: Number(rawOrder.finalTotalINR) || 0,
      items,
      createdAt: rawOrder.createdAt || Date.now(),
      timestamp: rawOrder.timestamp || new Date().toISOString(),
      status: rawOrder.status || 'Order Placed & Roasting',
      courierPartner: rawOrder.courierPartner || (rawOrder.shippingType === 'express' ? 'BlueDart Air Express' : 'Delhivery Surface'),
      trackingNumber: rawOrder.trackingNumber || `BD-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentStatus: rawOrder.paymentStatus || 'paid',
      paymentId: rawOrder.paymentId,
      paymentMethod: rawOrder.paymentMethod || 'Razorpay Online',
      emailSentSuccess: rawOrder.emailSentSuccess ?? true,
      emailMessage: rawOrder.emailMessage,
    };

    // Prevent duplicates
    const currentDbOrders = getDbOrders(true);
    const filtered = currentDbOrders.filter((o) => o.orderId.toLowerCase() !== newOrder.orderId.toLowerCase());
    const updatedOrders = [newOrder, ...filtered];
    updateDbOrders(updatedOrders);

    // Auto-decrement inventory stock on the server
    try {
      const products = getDbProducts();
      let inventoryModified = false;

      newOrder.items.forEach((item) => {
        const pIndex = products.findIndex((p) => p.id === item.productId);
        if (pIndex !== -1) {
          const currentStock = products[pIndex].stockQuantity ?? 50;
          const newStock = Math.max(0, currentStock - (item.quantity || 1));
          products[pIndex].stockQuantity = newStock;
          inventoryModified = true;
        }
      });

      if (inventoryModified) {
        updateDbProducts(products);
      }
    } catch (invErr) {
      console.error('[Orders] Failed to decrement inventory:', invErr);
    }

    return res.status(201).json({
      success: true,
      message: `Order ${newOrder.orderId} recorded successfully`,
      order: newOrder,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
