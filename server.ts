import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import createOrderHandler from './api/create-order.ts';
import verifyPaymentHandler from './api/verify-payment.ts';
import healthHandler from './api/health.ts';

// Load environment variables from .env with override
dotenv.config({ override: true });
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    for (const [k, v] of Object.entries(parsed)) {
      process.env[k] = v;
    }
  }
} catch (e) {
  // ignore
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-Encoded Body Parser for API requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint (compatible with Vercel & Express)
  app.all(['/api/health', '/api/health/'], healthHandler);

  /**
   * STEP 1: BACKEND - Create Order
   * Endpoint: POST /api/create-order
   */
  app.all(['/api/create-order', '/api/create-order/'], createOrderHandler);

  /**
   * STEP 3: BACKEND - Verify Signature
   * Endpoint: POST /api/verify-payment
   */
  app.all(['/api/verify-payment', '/api/verify-payment/'], verifyPaymentHandler);

  // Guard API routes so missing endpoints never fall through to HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found` });
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
