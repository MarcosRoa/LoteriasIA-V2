// ============================================
// CAMINHO: api/pro/status.ts
// ============================================
// STATUS PRO - USANDO ProService.sync()
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ProService } from '../../services/ProService';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateUser(uid: string, data: any) {
    await supabase
        .from('usuarios')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('uid', uid);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const uid = (req.query.uid || req.headers['x-user-id']) as string;
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('is_pro, pro_expires_at, email, creditos')
            .eq('uid', uid)
            .maybeSingle();
        
        if (!user || error) {
            return res.status(200).json({
                success: true,
                isPro: false,
                daysLeft: 0,
                proExpiresAt: null,
                credits: 0
            });
        }
        
        // ============================================
        // SINCRONIZAR STATUS PRO
        // ============================================
        const syncResult = await ProService.sync(
            {
                uid: user.uid,
                is_pro: user.is_pro,
                pro_expires_at: user.pro_expires_at,
                creditos: user.creditos,
                email: user.email
            },
            async (data) => await updateUser(user.uid, data)
        );
        
        // ============================================
        // PRO FIXO (ADMIN)
        // ============================================
        let isPro = syncResult.isPro;
        let daysLeft = syncResult.daysLeft;
        let proExpiresAt = syncResult.expiresAt;
        
        if (ProService.isProFixedEmail(user.email)) {
            isPro = true;
            daysLeft = 365;
            proExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
        
        return res.status(200).json({
            success: true,
            isPro,
            daysLeft,
            proExpiresAt,
            credits: user.creditos || 0,
            synced: syncResult.userUpdated
        });
        
    } catch (error: any) {
        console.error('Erro em /api/pro/status:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            isPro: false,
            daysLeft: 0,
            proExpiresAt: null,
            credits: 0
        });
    }
}
