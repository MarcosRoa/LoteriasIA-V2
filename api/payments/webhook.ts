import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CreditsService } from '../../services/CreditsService';

const creditsService = new CreditsService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { action, data } = req.body;
    if (action !== 'payment.created') return res.status(200).json({ message: 'Ignored' });
    
    const userId = data.external_reference;
    const amount = data.transaction_amount;
    
    if (!userId) return res.status(400).json({ error: 'Missing user reference' });
    
    try {
        const newBalance = await creditsService.addCredits(userId, amount, `webhook_${data.id}`);
        console.log(`✅ Créditos ad
