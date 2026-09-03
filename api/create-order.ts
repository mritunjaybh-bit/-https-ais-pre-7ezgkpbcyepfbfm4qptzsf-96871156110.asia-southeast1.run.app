import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load local .env with override
dotenv.config({ override: true });

function getCredentials() {
  let envFileVars: Record<string, string> = {};
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath));
      envFileVars = parsed;
    }
  } catch (e) {
    // ignore
  }

  const key_id = (
    envFileVars.RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    'rzp_test_TXiWmJNf8bquNa'
  ).trim().replace(/^["']|["']$/g, '');

  const key_secret = (
    envFileVars.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    'Tln2tKfSinwXZSwPOdG2WvJK'
  ).trim().replace(/^["']|["']$/g, '');

  return { key_id, key_secret };
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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

    // Runtime debug logging of first 6 characters of RAZORPAY_KEY_ID
    console.log(
      `[Razorpay /api/create-order] Runtime credentials loaded: RAZORPAY_KEY_ID prefix: "${key_id.slice(0, 6)}" (total length: ${key_id.length}), RAZORPAY_KEY_SECRET length: ${key_secret.length}`
    );

    if (!key_id || !key_secret) {
      const missingVars = [];
      if (!key_id) missingVars.push('RAZORPAY_KEY_ID');
      if (!key_secret) missingVars.push('RAZORPAY_KEY_SECRET');
      return res.status(401).json({
        error: `Missing required server environment variable(s): ${missingVars.join(', ')}. Please configure these in your deployment/Vercel settings.`,
      });
    }

    const numericAmount = Math.round(Number(amount));
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        error: 'Invalid order amount. Amount must be an integer and at least 100 paise (₹1.00 INR).',
      });
    }

    // Step 1: Explicit Basic Auth header (base64 of RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET)
    const basicAuth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    const authHeader = `Basic ${basicAuth}`;

    const orderPayload = {
      amount: numericAmount,
      currency: currency.toUpperCase(),
      receipt: receipt ? String(receipt).slice(0, 40) : `rcpt_${Date.now()}`,
      notes: {
        app: 'Ca Phe Vietnam Coffee Store',
      },
    };

    // Step 2: POST request to https://api.razorpay.com/v1/orders
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const responseData: any = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error('[Razorpay /api/create-order error]:', razorpayResponse.status, responseData);
      return res.status(razorpayResponse.status).json({
        error:
          responseData?.error?.description ||
          responseData?.error?.message ||
          responseData?.message ||
          'Razorpay order creation failed.',
        razorpay_error_code: responseData?.error?.code,
        key_id_prefix: key_id.slice(0, 6),
      });
    }

    return res.status(200).json({
      order_id: responseData.id,
      amount: responseData.amount,
      currency: responseData.currency,
      key_id,
    });
  } catch (err: any) {
    console.error('[Razorpay /api/create-order exception]:', err);
    return res.status(500).json({
      error: err?.message || 'Internal server error while creating Razorpay order.',
    });
  }
}
