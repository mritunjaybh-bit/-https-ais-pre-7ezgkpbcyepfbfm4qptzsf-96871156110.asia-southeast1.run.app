import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import paymentsHandler from './api/payments.ts';
import healthHandler from './api/health.ts';
import coffeeMasterHandler from './api/coffee-master.ts';
import adminHandler from './api/admin.ts';
import publicProductsHandler from './api/products.ts';
import ordersHandler from './api/orders.ts';

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

  // Health check endpoint
  app.all(['/api/health', '/api/health/'], healthHandler);

  /**
   * Consolidated Payments (Razorpay Order Creation & Verification)
   * Endpoints: POST /api/payments, /api/create-order, /api/verify-payment
   */
  app.all(
    ['/api/payments', '/api/payments/', '/api/create-order', '/api/verify-payment'],
    paymentsHandler
  );

  /**
   * AI Shopping Assistant: "Coffee Master"
   * Endpoint: POST /api/coffee-master
   */
  app.all(['/api/coffee-master', '/api/coffee-master/'], coffeeMasterHandler);

  /**
   * Public Products & Live Stock/Pricing Catalog
   * Endpoint: GET /api/products
   */
  app.all(['/api/products', '/api/products/'], publicProductsHandler);

  /**
   * Consolidated Admin (Auth, Setup, Password Reset, Products, Inventory, Prices)
   * Endpoints: /api/admin, /api/admin/*, /api/setup
   */
  app.all(
    [
      '/api/admin',
      '/api/admin/*',
      '/api/setup',
      '/api/setup/',
    ],
    adminHandler
  );

  /**
   * Orders Database
   * Endpoints: GET/POST/PATCH /api/orders, /api/orders/*
   */
  app.all(['/api/orders', '/api/orders/:id', '/api/orders/*'], ordersHandler);

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
