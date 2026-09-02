import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import createOrderHandler from './api/create-order.ts';
import verifyPaymentHandler from './api/verify-payment.ts';
import healthHandler from './api/health.ts';

// Load environment variables from .env
dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API requests
  app.use(express.json());

  // Health check endpoint (compatible with Vercel & Express)
  app.get('/api/health', healthHandler);

  /**
   * STEP 1: BACKEND - Create Order
   * Endpoint: POST /api/create-order
   */
  app.post('/api/create-order', createOrderHandler);

  /**
   * STEP 3: BACKEND - Verify Signature
   * Endpoint: POST /api/verify-payment
   */
  app.post('/api/verify-payment', verifyPaymentHandler);

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
