// ============================================
// CAMINHO: api/pro/renew.ts
// ============================================
// RENOVAÇÃO PRO - APÓS PAGAMENTO CONFIRMADO
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { ProService } from '../../src/services/ProService.js';

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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    // 🔥 IMPORTANTE: Esta rota só deve ser chamada após a confirmação do pagamento
    const uid = req.headers['x-user-id'] || req.body?.uid;
    const paymentConfirmed = req.body?.paymentConfirmed || false;
    
    if (!uid) {
        return res.status(400).json({ error: 'UID é obrigatório' });
    }
    
    // 🔥 Garantir que só é chamada após pagamento confirmado
    if (!paymentConfirmed) {
        return res.status(403).json({
            success: false,
            error: 'Pagamento não confirmado. Esta rota requer confirmação de pagamento.'
        });
    }
    
    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('is_pro, pro_expires_at, creditos, email')
            .eq('uid', uid)
            .maybeSingle();
        
        if (error || !user) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }
        
        // ============================================
        // RENOVAR PRO (COM SOMA DE DIAS)
        // ============================================
        const result = await ProService.renew(
            {
                uid: user.uid,
                is_pro: user.is_pro,
                pro_expires_at: user.pro_expires_at,
                creditos: user.creditos,
                email: user.email
            },
            async (data) => await updateUser(user.uid, data)
        );
        
        return res.status(200).json({
            success: true,
            isPro: true,
            daysLeft: result.daysLeft,
            proExpiresAt: result.newExpiresAt,
            credits: user.creditos,
            message: `Plano PRO renovado! Válido por ${result.daysLeft} dias.`
        });
        
    } catch (error: any) {
        console.error('❌ Erro na renovação PRO:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao renovar plano PRO'
        });
    }
}
