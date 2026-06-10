// api/payments/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CreditsService } from '../../services/CreditsService';

const creditsService = new CreditsService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const newBalance = await creditsService.addCredits(userId, amount, `simulation_${Date.now()}`);
        
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
