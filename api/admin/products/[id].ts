import { adminProductsHandler } from '../../products';

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract ID from query parameter [id] or URL
  const id = req.query?.id || req.url?.split('/').pop()?.split('?')[0];
  req.query = req.query || {};
  if (id) {
    req.query.id = id;
  }
  req.path = `/api/admin/products/${id || ''}`;
  return adminProductsHandler(req, res);
}
