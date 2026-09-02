import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config({ override: true });

function getCredentials() {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  return { key_id, key_secret };
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ error: 'Malformed JSON body.' });
      }
    }
    body = body || {};

    const { amount, currency = 'INR', receipt } = body;
    const { key_id, key_secret } = getCredentials();

    if (!key_id || !key_secret) {
      return res.status(401).json({
        error: 'Razorpay API credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing. Please configure them in your environment variables.',
      });
    }

    const numericAmount = Math.round(Number(amount));
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        error: 'Invalid order amount. Amount must be an integer and at least 100 paise (₹1.00 INR).',
      });
    }

    const instance = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: numericAmount,
      currency: currency.toUpperCase(),
      receipt: receipt ? String(receipt).slice(0, 40) : `rcpt_${Date.now()}`,
      notes: {
        app: 'Ca Phe Vietnam Coffee Store',
      },
    };

    const razorpayOrder = await instance.orders.create(options);

    return res.status(200).json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err: any) {
    console.error('[Razorpay /api/create-order error]:', err);

    if (err.statusCode === 401 || err?.error?.code === 'BAD_REQUEST_ERROR') {
      return res.status(err.statusCode || 401).json({
        error: err?.error?.description || err.message || 'Razorpay authentication or validation failed.',
      });
    }

    return res.status(500).json({
      error: err?.error?.description || err.message || 'Failed to create Razorpay order.',
    });
  }
}
