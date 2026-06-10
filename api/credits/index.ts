// api/credits/index.ts
// api/credits/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../core/database/supabase';
import { env } from '../../core/config/env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const uid = (req.query.uid || req.headers['x-user-id']) as string;
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    try {
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .maybeSingle();
        
        if (!user && !error) {
            const email = (req.headers['x-user-email'] as string) || `${uid}@temp.com`;
            const nome = (req.headers['x-user-name'] as string) || email.split('@')[0];
            
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid, nome, email,
                    creditos: env.defaultCredits,
                    is_pro: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('creditos, is_pro, email')
                .single();
            
            if (insertError) throw insertError;
            user = newUser;
        } else if (error) {
            throw error;
        }
        
        let credits = user.creditos;
        let isPro = user.is_pro;
        
        if (user.email === env.proFixedEmail) {
            isPro = true;
            if (credits !== env.proCredits) {
                await supabase
                    .from('usuarios')
                    .update({ creditos: env.proCredits, is_pro: true })
                    .eq('uid', uid);
                credits = env.proCredits;
            }
        }
        
        return res.status(200).json({ success: true, credits, isPro });
        
    } catch (error: any) {
        console.error('Erro em /api/credits:', error);
        return res.status(500).json({ error: error.message });
    }
}
