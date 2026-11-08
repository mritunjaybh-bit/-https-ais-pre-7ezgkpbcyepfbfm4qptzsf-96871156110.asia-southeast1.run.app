import type { Request, Response } from 'express';
import { getDbSubscribers, addDbSubscriber, getDbOrders, DatabaseNotConfiguredError } from './_lib/db.ts';

export default async function handler(req: any, res: any) {
  return subscribersHandler(req, res);
}

export async function subscribersHandler(req: Request, res: Response) {
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
    try {
      const subscribers = await getDbSubscribers();

      // Check if CSV export is requested
      if (req.query.format === 'csv') {
        const orders = (await getDbOrders()) || [];

        const csvRows = [
          'ID,Email,Phone,Product of Interest,Consent,Created At,Order Status,Orders Placed,Total Spent (INR),Source,Discount Code',
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
            const phoneVal = (s.phone || '').replace(/"/g, '""');
            const interestVal = (s.interest || '').replace(/"/g, '""');
            const consentVal = s.consent ? 'Yes' : 'No';
            return `"${s.id}","${s.email}","${phoneVal}","${interestVal}","${consentVal}","${s.createdAt}","${statusText}","${orderCount}","₹${totalSpent}","${s.source || ''}","${s.discountCode || ''}"`;
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
    } catch (err: any) {
      if (err instanceof DatabaseNotConfiguredError || err?.message === 'database not configured') {
        return res.status(503).json({ error: 'database not configured' });
      }
      return res.status(500).json({ error: 'Failed to retrieve subscribers' });
    }
  }

  // POST /api/subscribers - Submit new subscriber or waitlist entry
  if (req.method === 'POST') {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const source = String(req.body.source || 'waitlist').trim();
      const discountCode = String(req.body.discountCode || '').trim();
      const phone = req.body.phone ? String(req.body.phone).trim() : undefined;
      const interest = req.body.interest ? String(req.body.interest).trim() : undefined;
      const consent = Boolean(req.body.consent);

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Please enter a valid email address.',
        });
      }

      const { subscriber, isNew } = await addDbSubscriber({
        email,
        source,
        discountCode: discountCode || undefined,
        phone,
        interest,
        consent,
      });

      return res.status(200).json({
        success: true,
        isNew,
        message: isNew
          ? 'You have been registered on the waitlist!'
          : 'You are already registered on the waitlist. Your preferences have been updated!',
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          phone: subscriber.phone,
          interest: subscriber.interest,
          createdAt: subscriber.createdAt,
        },
      });
    } catch (err: any) {
      if (err instanceof DatabaseNotConfiguredError || err?.message === 'database not configured') {
        return res.status(503).json({ error: 'database not configured' });
      }
      return res.status(500).json({
        error: 'Unable to register your waitlist entry at this moment. Please try again shortly.',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
