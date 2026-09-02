import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';

// Load environment variables from .env
dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TXLMB808xUqZ2s';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'uYTFFmToofIEfvawQPYjIbVn';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API requests
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      razorpay_configured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * STEP 1: BACKEND - Create Order
   * Endpoint: POST /api/create-order
   * Request Body: { amount (paise), currency, receipt }
   * Returns: { order_id, amount, currency }
   * Validations:
   * - Validate amount >= 100 paise (1 INR)
   * - Handle auth failures (401)
   * - Handle Razorpay API errors (500)
   */
  app.post('/api/create-order', async (req: Request, res: Response) => {
    try {
      const { amount, currency = 'INR', receipt } = req.body;

      // Validate credentials
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return res.status(401).json({
          error: 'Razorpay API credentials (KEY_ID or KEY_SECRET) are not configured on the server.',
        });
      }

      // Validate amount
      const numericAmount = Math.round(Number(amount));
      if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
        return res.status(400).json({
          error: 'Invalid order amount. Amount must be an integer and at least 100 paise (₹1.00 INR).',
        });
      }

      const instance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
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

      // Distinguish auth / bad request vs server error
      if (err.statusCode === 401 || err?.error?.code === 'BAD_REQUEST_ERROR') {
        return res.status(err.statusCode || 401).json({
          error: err?.error?.description || err.message || 'Razorpay authentication or validation failed.',
        });
      }

      return res.status(500).json({
        error: err?.error?.description || err.message || 'Failed to create Razorpay order.',
      });
    }
  });

  /**
   * STEP 3: BACKEND - Verify Signature
   * Endpoint: POST /api/verify-payment
   * Request Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
   * Compare generated signature with razorpay_signature
   * Returns:
   * - 200 { success: true, message: 'Payment verified successfully' }
   * - 400 { success: false, error: '...' } on mismatch or missing fields
   */
  app.post('/api/verify-payment', (req: Request, res: Response) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, or razorpay_signature',
        });
      }

      if (!RAZORPAY_KEY_SECRET) {
        return res.status(500).json({
          success: false,
          error: 'Razorpay secret key is not configured on the server.',
        });
      }

      // Generate expected HMAC-SHA256 signature
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

      // Constant-time string comparison to prevent timing attacks
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
