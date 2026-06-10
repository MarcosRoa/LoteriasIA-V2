// api/generate/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GenerateService } from '../../services/GenerateService';

const generateService = new GenerateService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { uid, lottery, quantity, extraNumbers, mode } = req.body;
    
    if (!uid || !lottery || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (quantity < 1 || quantity > 20) {
        return res.status(400).json({ error: 'Quantity must be between 1 and 20' });
    }
    
    try {
        const result = await generateService.generateGames(uid, lottery, quantity, extraNumbers, mode);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Erro em /api/generate:', error);
        
        if (error.message === 'Saldo insuficiente') {
            return res.status(402).json({ error: error.message });
        }
        
        return res.status(500).json({ error: 'Internal server error' });
    }
}
