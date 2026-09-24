import { getDbOrders, updateDbOrders } from '../db';
import { isValidSession } from '../admin-auth';
import { OrderState } from '../../src/types';

export default async function handler(req: any, res: any) {
  // CORS Headers
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract orderId from query parameter or url path
  const orderId = req.query?.id || req.url?.split('/').pop()?.split('?')[0];

  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId parameter' });
  }

  const orders = getDbOrders();
  const orderIndex = orders.findIndex(
    (o) => o.orderId.toLowerCase() === String(orderId).trim().toLowerCase()
  );

  if (orderIndex === -1) {
    return res.status(404).json({ error: `Order ${orderId} not found` });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ order: orders[orderIndex] });
  }

  if (req.method === 'PATCH') {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!isValidSession(token)) {
      return res.status(401).json({ error: 'Unauthorized: Admin session required' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const { status, trackingNumber, courierPartner } = body;

    if (status) {
      orders[orderIndex].status = status as OrderState;
    }
    if (trackingNumber !== undefined) {
      orders[orderIndex].trackingNumber = trackingNumber;
    }
    if (courierPartner !== undefined) {
      orders[orderIndex].courierPartner = courierPartner;
    }

    updateDbOrders(orders);

    return res.status(200).json({
      success: true,
      message: `Order ${orderId} updated`,
      order: orders[orderIndex],
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
