// api/payment/products.ts
import { CONSTANTS } from '../../core/config/constants.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const packages = Object.entries(CONSTANTS.CREDIT_PACKAGES).map(([id, credits]) => ({
    id,
    amount: Number(id),
    credits,
  }));

  return res.status(200).json({
    success: true,
    packages,
    pro: {
      price: CONSTANTS.PRO_PRICE,
      durationDays: CONSTANTS.PRO_DURATION_DAYS,
    },
  });
}
