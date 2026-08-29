// ============================================
// CAMINHO: api/credits/index.ts
// ============================================
// CRÉDITOS - USANDO ProService.sync()
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ProService } from '../../services/ProService.js';
import { CONSTANTS } from '../../core/config/constants.js';

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
    
    const auth = await authenticate(req, res);
    if (!auth) return;
    
    const { uid, email, name } = auth;
    
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    try {
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .maybeSingle();
        
        if (error) throw error;
        
        // ============================================
        // NOVO USUÁRIO → TRIAL PRO
        // ============================================
        if (!user) {
            const trialData = ProService.criarTrialUser();
            
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid,
                    nome: name || email?.split('@')[0] || 'Usuário',
                    email: email || `${uid}@temp.com`,
                    creditos: trialData.creditos,
                    is_pro: trialData.is_pro,
                    pro_expires_at: trialData.pro_expires_at,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('*')
                .single();
            
            if (insertError) throw insertError;
            user = newUser;
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
        let credits = user.creditos;
        let isPro = syncResult.isPro || ProService.isProFixedEmail(email);
        
        if (ProService.isProFixedEmail(email)) {
            isPro = true;
            if (credits !== CONSTANTS.PRO_FIXED_CREDITS) {
                await updateUser(user.uid, {
                    creditos: CONSTANTS.PRO_FIXED_CREDITS,
                    is_pro: true,
                    pro_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                });
                credits = CONSTANTS.PRO_FIXED_CREDITS;
            }
        }
        
        return res.status(200).json({
            success: true,
            credits,
            isPro,
            daysLeft: syncResult.daysLeft,
            proExpiresAt: syncResult.expiresAt
        });

    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
