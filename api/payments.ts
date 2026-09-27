import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    const { key_id, key_secret } = getCredentials();

    // Determine Action:
    // 1. Explicit action field
    // 2. Query param ?action=...
    // 3. Heuristic: if razorpay_signature present -> verify-payment, else if amount present -> create-order
    const action = (
      body.action ||
      req.query?.action ||
      (body.razorpay_signature || body.razorpay_payment_id ? 'verify-payment' : 'create-order')
    )
      .toString()
      .toLowerCase();

    // -------------------------------------------------------------
    // ACTION: create-order
    // -------------------------------------------------------------
    if (action === 'create-order' || action === 'create') {
      const { amount, currency = 'INR', receipt } = body;

      if (!key_id || !key_secret) {
        return res.status(401).json({
          error: 'Missing Razorpay credentials. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.',
        });
      }

      const numericAmount = Math.round(Number(amount));
      if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
        return res.status(400).json({
          error: 'Invalid order amount. Amount must be an integer and at least 100 paise (₹1.00 INR).',
        });
      }

      const basicAuth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
      const orderPayload = {
        amount: numericAmount,
        currency: currency.toUpperCase(),
        receipt: receipt ? String(receipt).slice(0, 40) : `rcpt_${Date.now()}`,
        notes: {
          app: 'Ca Phe Vietnam Coffee Store',
        },
      };

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const responseData: any = await razorpayResponse.json();

      if (!razorpayResponse.ok) {
        console.error('[Payments create-order error]:', razorpayResponse.status, responseData);
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
    }

    // -------------------------------------------------------------
    // ACTION: verify-payment
    // -------------------------------------------------------------
    if (action === 'verify-payment' || action === 'verify') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature',
        });
      }

      if (!key_secret) {
        return res.status(500).json({
          success: false,
          error: 'Razorpay secret key is not configured in server environment variables.',
        });
      }

      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(payload)
        .digest('hex');

      const isSignatureValid =
        expectedSignature.length === razorpay_signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf8'),
          Buffer.from(razorpay_signature, 'utf8')
        );

      if (isSignatureValid) {
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
        });
      } else {
        console.warn(
          `[Payments Signature Mismatch] Expected: ${expectedSignature} | Received: ${razorpay_signature}`
        );
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature. Payment could not be verified.',
        });
      }
    }

    return res.status(400).json({
      error: `Unknown action: '${action}'. Supported actions: 'create-order', 'verify-payment'`,
    });
  } catch (err: any) {
    console.error('[Payments handler error]:', err);
    return res.status(500).json({
      error: err?.message || 'Internal server error while processing payment request.',
    });
  }
}
