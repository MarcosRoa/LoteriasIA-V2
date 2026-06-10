// api/payments/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PaymentService } from '../../services/PaymentService';
import { validateAuth } from '../../middleware/auth';

const paymentService = new PaymentService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { isValid, uid, error } = validateAuth(req);
    if (!isValid) return res.status(401).json({ error: error || 'Unauthorized' });
    
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Missing amount' });
    
    try {
        const newBalance = await paymentService.simulatePayment(uid, amount);
        return res.status(200).json({
            success: true,
            mode: 'simulation',
            newBalance,
            message: `R$ ${amount} adicionados com sucesso!`
        });
    } catch (error) {
        console.error('Erro em /api/payments/create:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
