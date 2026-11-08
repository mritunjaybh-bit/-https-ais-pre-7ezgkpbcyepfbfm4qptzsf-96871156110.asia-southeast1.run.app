import type { Request, Response } from 'express';
import {
  getDbProducts,
  updateDbProducts,
  getDbSiteSettings,
  getDbReviews,
  createDbReview,
  createDbPreOrder,
  DatabaseNotConfiguredError,
} from './_lib/db.ts';
import { isValidSession } from './_lib/auth-util.ts';
import type { ProductItem } from '../src/types.ts';

export default async function handler(req: any, res: any) {
  // CORS Headers
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST actions (pre-orders, reviews submission, circle membership)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};
    const action = String(body.action || req.query.action || '').toLowerCase();

    // 1. Pre-order / Waitlist submission
    if (action === 'create-pre-order' || action === 'pre-order') {
      try {
        const { customerName, customerContact, productId, productName, quantity, notes } = body;
        if (!customerName || !customerContact || !productId) {
          return res.status(400).json({ error: 'Name, contact detail (email or phone), and product are required.' });
        }

        const preOrder = await createDbPreOrder({
          customerName: String(customerName),
          customerContact: String(customerContact),
          productId: String(productId),
          productName: String(productName || productId),
          quantity: Number(quantity) || 1,
          notes: notes ? String(notes) : undefined,
        });

        return res.status(201).json({
          success: true,
          message: 'Your waitlist reservation has been received. Our team will contact you directly.',
          preOrder,
        });
      } catch (err: any) {
        if (err instanceof DatabaseNotConfiguredError || err?.message === 'database not configured') {
          return res.status(503).json({ error: 'database not configured' });
        }
        return res.status(500).json({ error: 'Failed to record pre-order' });
      }
    }

    // 2. Verified Customer Review submission
    if (action === 'submit-review' || action === 'review') {
      try {
        const { productId, orderId, customerEmail, customerName, rating, title, comment } = body;
        if (!productId || !orderId || !customerEmail || !customerName || !rating || !comment) {
          return res.status(400).json({
            error: 'Product, Order ID, customer email, your name, rating, and review text are all required.',
          });
        }

        const result = await createDbReview({
          productId: String(productId),
          orderId: String(orderId),
          customerEmail: String(customerEmail),
          customerName: String(customerName),
          rating: Number(rating) || 5,
          title: title ? String(title) : undefined,
          comment: String(comment),
        });

        return res.status(201).json({
          success: true,
          message: 'Your review has been submitted for roastery verification and will appear once approved by the Roastery Owner.',
          review: result.review,
        });
      } catch (err: any) {
        if (err instanceof DatabaseNotConfiguredError || err?.message === 'database not configured') {
          return res.status(503).json({ error: 'database not configured' });
        }
        return res.status(500).json({ error: 'Failed to submit review' });
      }
    }

    // 3. Circle Member Profile / Sign-in: DISABLED - Circle opens at launch
    if (action === 'circle-member' || action === 'circle-profile') {
      return res.status(200).json({
        success: false,
        message: 'Circle opens at launch',
        member: null,
      });
    }

    // 4. Circle Beans Redeem: DISABLED - Circle opens at launch
    if (action === 'circle-redeem') {
      return res.status(200).json({
        success: false,
        message: 'Circle opens at launch',
        error: 'Circle opens at launch',
      });
    }
  }

  try {
    const products = await getDbProducts();

    // Filter for customer storefront: only active products
    const activeProducts = products
      .filter((p) => p.isActive !== false)
      .map((p) => ({
        ...p,
        isOutOfStock: (p.stockQuantity ?? 0) <= 0,
      }));

    const siteSettings = await getDbSiteSettings();
    const approvedReviews = await getDbReviews(false); // Only approved reviews for public

    return res.status(200).json({
      products: activeProducts,
      count: activeProducts.length,
      siteSettings,
      reviews: approvedReviews,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    if (err instanceof DatabaseNotConfiguredError || err?.message === 'database not configured') {
      return res.status(503).json({ error: 'database not configured' });
    }
    return res.status(500).json({ error: 'database not configured' });
  }
}

export function publicProductsHandler(req: Request, res: Response) {
  return handler(req, res);
}

export async function adminProductsHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify Admin Session Token
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || (req.query?.token as string);

  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Unauthorized: Admin session invalid or expired' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  req.body = body || {};

  try {
    const products = await getDbProducts();

    // 1. GET /api/admin/products - List all products including inactive & raw stock
    if (req.method === 'GET') {
      return res.status(200).json({
        products,
        count: products.length,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. PATCH /api/admin/inventory - Update stock quantities
    if (req.method === 'PATCH' && req.path.includes('inventory')) {
      const { updates } = req.body;
      if (!updates) {
        return res.status(400).json({ error: 'Missing updates payload' });
      }

      const updatesList: Array<{ id: string; stockQuantity: number }> = Array.isArray(updates)
        ? updates
        : [updates];

      const updatedProducts = products.map((prod) => {
        const match = updatesList.find((u) => u.id === prod.id);
        if (match) {
          return {
            ...prod,
            stockQuantity: Math.max(0, Number(match.stockQuantity) || 0),
          };
        }
        return prod;
      });

      await updateDbProducts(updatedProducts);
      return res.status(200).json({
        success: true,
        message: `Updated stock for ${updatesList.length} products`,
        products: updatedProducts,
      });
    }

    // 3. PATCH /api/admin/prices - Update base prices
    if (req.method === 'PATCH' && req.path.includes('prices')) {
      const { updates } = req.body;
      if (!updates) {
        return res.status(400).json({ error: 'Missing updates payload' });
      }

      const updatesList: Array<{ id: string; basePriceINR: number }> = Array.isArray(updates)
        ? updates
        : [updates];

      const updatedProducts = products.map((prod) => {
        const match = updatesList.find((u) => u.id === prod.id);
        if (match) {
          return {
            ...prod,
            basePriceINR: Math.max(1, Math.round(Number(match.basePriceINR) || prod.basePriceINR)),
          };
        }
        return prod;
      });

      await updateDbProducts(updatedProducts);
      return res.status(200).json({
        success: true,
        message: `Updated prices for ${updatesList.length} products`,
        products: updatedProducts,
      });
    }

    // 4. POST /api/admin/products - Add New Product
    if (req.method === 'POST') {
      const newProd = req.body as Partial<ProductItem>;
      if (!newProd.name || !newProd.basePriceINR || !newProd.category) {
        return res.status(400).json({ error: 'Name, Category, and Base Price are required.' });
      }

      const id =
        newProd.id ||
        newProd.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
          '-' +
          Date.now().toString().slice(-4);

      const fullProduct: ProductItem = {
        id,
        name: newProd.name.trim(),
        vietnameseName: newProd.vietnameseName?.trim() || newProd.name.trim(),
        tagline: newProd.tagline?.trim() || 'A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.',
        description: newProd.description?.trim() || 'Authentic Vietnamese coffee experience.',
        category: newProd.category,
        flavorType: newProd.flavorType || undefined,
        isFlavoured: Boolean(newProd.isFlavoured || newProd.flavorType),
        isInstant: Boolean(newProd.isInstant || newProd.category === 'instant-coffee'),
        basePriceINR: Math.max(0, Math.round(Number(newProd.basePriceINR) || 0)),
        stockQuantity: Math.max(0, Number(newProd.stockQuantity) ?? 50),
        isActive: newProd.isActive !== false,
        imageUrl:
          newProd.imageUrl?.trim() ||
          'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
        badge: newProd.badge || 'Coming soon',
        roastLevel: newProd.roastLevel || 'Medium-Dark',
        beanBlend: newProd.beanBlend || '100% Vietnamese Highlands Robusta',
        caffeineScore: newProd.caffeineScore || 4,
        tastingNotes: Array.isArray(newProd.tastingNotes)
          ? newProd.tastingNotes
          : typeof newProd.tastingNotes === 'string'
          ? (newProd.tastingNotes as string).split(',').map((s) => s.trim())
          : ['Dark Cocoa', 'Toasted Hazelnut', 'Molasses'],
        originRegion: newProd.originRegion || 'Vietnam High-Plateau Highlands',
        elevation: newProd.elevation || '800m',
        process: newProd.process || 'Natural Sun-Dried Honey',
        shelfLife: newProd.shelfLife || '12 Months Freshness Guaranteed',
        rating: 5.0,
        reviewsCount: 1,
        brewingRecommendation:
          newProd.brewingRecommendation ||
          'Drip slow through a Phin gravity filter over sweetened condensed milk.',
        availableSizes: newProd.availableSizes && newProd.availableSizes.length > 0
          ? newProd.availableSizes
          : [
              { size: '250g Valve Pouch', priceMultiplier: 1.0, weightGrams: 250 },
              { size: '500g Fresh Pack', priceMultiplier: 1.85, weightGrams: 500 },
              { size: '1kg Roastery Bag', priceMultiplier: 3.4, weightGrams: 1000 },
            ],
        availableGrinds: newProd.availableGrinds || [
          'Authentic Phin Grind (Coarse)',
          'Espresso & Moka Pot (Fine)',
          'Pour Over & Drip (Medium)',
          'Whole Beans (Un-ground)',
        ],
      };

      const updated = [fullProduct, ...products];
      await updateDbProducts(updated);

      return res.status(201).json({
        success: true,
        message: `Product "${fullProduct.name}" created successfully`,
        product: fullProduct,
      });
    }

    // 5. PUT /api/admin/products/:id - Edit existing product details
    if (req.method === 'PUT') {
      const targetId = req.query.id || req.body.id;
      if (!targetId) {
        return res.status(400).json({ error: 'Missing product ID' });
      }

      const index = products.findIndex((p) => p.id === targetId);
      if (index === -1) {
        return res.status(404).json({ error: `Product ${targetId} not found` });
      }

      const current = products[index];
      const updateData = req.body;

      const merged: ProductItem = {
        ...current,
        ...updateData,
        id: current.id,
        basePriceINR:
          updateData.basePriceINR !== undefined
            ? Math.max(1, Math.round(Number(updateData.basePriceINR)))
            : current.basePriceINR,
        stockQuantity:
          updateData.stockQuantity !== undefined
            ? Math.max(0, Number(updateData.stockQuantity))
            : current.stockQuantity,
        isActive: updateData.isActive !== undefined ? Boolean(updateData.isActive) : current.isActive,
      };

      products[index] = merged;
      await updateDbProducts(products);

      return res.status(200).json({
        success: true,
        message: `Product "${merged.name}" updated successfully`,
        product: merged,
      });
    }

    // 6. DELETE /api/admin/products/:id - Archive or delete product
    if (req.method === 'DELETE') {
      const targetId = req.query.id || req.body?.id;
      if (!targetId) {
        return res.status(400).json({ error: 'Missing product ID' });
      }

      const filtered = products.filter((p) => p.id !== targetId);
      await updateDbProducts(filtered);

      return res.status(200).json({
        success: true,
        message: `Product ${targetId} deleted`,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    if (err instanceof DatabaseNotConfiguredError || err?.message === 'database not configured') {
      return res.status(503).json({ error: 'database not configured' });
    }
    return res.status(500).json({ error: 'database not configured' });
  }
}
