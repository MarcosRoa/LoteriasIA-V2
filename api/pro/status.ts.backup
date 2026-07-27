// api/pro/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
//import ws from 'ws';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
   
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const uid = (req.query.uid || req.headers['x-user-id']) as string;
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('is_pro, pro_expires_at, email')
            .eq('uid', uid)
            .maybeSingle();
        
        if (!user || error) {
            return res.status(200).json({ success: true, isPro: false, daysLeft: 0 });
        }
        
        const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';
        
        if (user.email === PRO_FIXED_EMAIL) {
            return res.status(200).json({ success: true, isPro: true, daysLeft: 365 });
        }
        
        let daysLeft = 0;
        if (user.is_pro && user.pro_expires_at) {
            const expiresAt = new Date(user.pro_expires_at);
            const now = new Date();
            daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
        
        return res.status(200).json({ success: true, isPro: user.is_pro || false, daysLeft });
        
    } catch (error: any) {
        console.error('Erro em /api/pro/status:', error);
        return res.status(500).json({ error: error.message });
    }
}
