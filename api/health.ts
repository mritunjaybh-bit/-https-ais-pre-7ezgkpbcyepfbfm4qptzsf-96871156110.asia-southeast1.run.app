import dotenv from 'dotenv';

dotenv.config();

export default function handler(req: any, res: any) {
  const key_id = (process.env.RAZORPAY_KEY_ID || '').trim().replace(/^["']|["']$/g, '');
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    razorpay_configured: Boolean(key_id && key_secret),
    has_RAZORPAY_KEY_ID: Boolean(key_id),
    has_RAZORPAY_KEY_SECRET: Boolean(key_secret),
    timestamp: new Date().toISOString(),
  });
}
