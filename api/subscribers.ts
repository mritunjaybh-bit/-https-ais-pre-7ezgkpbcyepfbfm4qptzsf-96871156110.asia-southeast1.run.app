import { Request, Response } from 'express';
import { getDbSubscribers, addDbSubscriber } from './_lib/db';
import { isValidSession } from './_lib/auth-util';

export default async function handler(req: any, res: any) {
  return subscribersHandler(req, res);
}

export function subscribersHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

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

  // GET /api/subscribers - View or Export subscribers
  if (req.method === 'GET') {
    const subscribers = getDbSubscribers();

    // Check if CSV export is requested
    if (req.query.format === 'csv') {
      const { getDbOrders } = require('./_lib/db');
      const orders = getDbOrders() || [];

      const csvRows = [
        'ID,Email,Created At,Order Status,Orders Placed,Total Spent (INR),Source,Discount Code',
        ...subscribers.map((s) => {
          const sEmail = (s.email || '').trim().toLowerCase();
          const customerOrders = orders.filter(
            (o: any) => (o.customerEmail || '').trim().toLowerCase() === sEmail
          );
          const hasOrdered = customerOrders.length > 0;
          const orderCount = customerOrders.length;
          const totalSpent = customerOrders.reduce(
            (sum: number, o: any) => (o.status !== 'Cancelled' ? sum + (Number(o.finalTotalINR) || 0) : sum),
            0
          );
          const statusText = hasOrdered ? 'Converted Customer' : 'Lead (Not yet ordered)';
          return `"${s.id}","${s.email}","${s.createdAt}","${statusText}","${orderCount}","₹${totalSpent}","${s.source || ''}","${s.discountCode || ''}"`;
        }),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="caphe_subscribers.csv"');
      return res.status(200).send(csvRows);
    }

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  }

  // POST /api/subscribers - Submit new subscriber
  if (req.method === 'POST') {
    const email = String(req.body.email || '').trim().toLowerCase();
    const source = String(req.body.source || 'exit_intent_popup').trim();
    const discountCode = String(req.body.discountCode || 'XINCHAO10').trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address.',
      });
    }

    const { subscriber, isNew } = addDbSubscriber({
      email,
      source,
      discountCode,
    });

    console.log(`[Subscribers] ${isNew ? 'New' : 'Existing'} subscriber recorded: ${email}`);

    return res.status(200).json({
      success: true,
      isNew,
      message: 'Discount code unlocked successfully!',
      discountCode: subscriber.discountCode || 'XINCHAO10',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        createdAt: subscriber.createdAt,
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
