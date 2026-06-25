// api/user/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { uid } = req.body;
        
        if (!uid) {
            return res.status(400).json({ error: 'UID é obrigatório' });
        }
        
        // 🔒 Busca o usuário no Supabase
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('is_pro')
            .eq('uid', uid)
            .single();
        
        if (error || !user) {
            return res.status(200).json({ isPro: false });
        }
        
        return res.status(200).json({ isPro: user.is_pro || false });
        
    } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
        return res.status(200).json({ isPro: false });
    }
}
