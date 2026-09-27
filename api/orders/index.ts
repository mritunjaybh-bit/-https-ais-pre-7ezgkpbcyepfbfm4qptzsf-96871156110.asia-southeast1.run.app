import { ordersHandler } from '../orders';

export default async function handler(req: any, res: any) {
  return ordersHandler(req, res);
}
