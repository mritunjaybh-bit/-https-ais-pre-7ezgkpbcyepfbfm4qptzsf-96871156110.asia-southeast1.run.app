import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ override: true });

function getSecret() {
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

  return (
    envFileVars.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    'Tln2tKfSinwXZSwPOdG2WvJK'
  ).trim().replace(/^["']|["']$/g, '');
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const key_secret = getSecret();

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
      crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf8'), Buffer.from(razorpay_signature, 'utf8'));

    if (isSignatureValid) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
    } else {
      console.warn(
        `[Razorpay Signature Mismatch] Expected: ${expectedSignature} | Received: ${razorpay_signature}`
      );
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Payment could not be verified.',
      });
    }
  } catch (err: any) {
    console.error('[Razorpay /api/verify-payment error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Error occurred while verifying payment signature.',
    });
  }
}
