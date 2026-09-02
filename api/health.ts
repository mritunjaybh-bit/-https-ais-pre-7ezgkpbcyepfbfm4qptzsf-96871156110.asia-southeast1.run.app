import dotenv from 'dotenv';

dotenv.config({ override: true });

export default function handler(req: any, res: any) {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    razorpay_configured: Boolean(key_id && key_secret),
    timestamp: new Date().toISOString(),
  });
}
