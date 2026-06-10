// api/credits/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CreditsService } from '../../services/CreditsService';
import { validateAuth } from '../../middleware/auth';
import { rateLimit } from '../../middleware/rateLimit';

const creditsService = new CreditsService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const { isValid, uid, error } = validateAuth(req);
    if (!isValid) return res.status(401).json({ error: error || 'Unauthorized' });
    
    if (!rateLimit(`credits_${uid}`)) {
        return res.status(429).json({ error: 'Too many requests' });
    }
    
    try {
        const { credits, isPro } = await creditsService.getBalance(uid);
        return res.status(200).json({ success: true, credits, isPro });
    } catch (error) {
        console.error('Erro em /api/credits:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
