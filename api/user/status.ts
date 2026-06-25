// api/user/status.ts 25//06/2026
// api/user/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email fixo PRO
const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }
    
    try {
        const { uid } = req.body;
        
        if (!uid) {
            return res.status(400).json({
                success: false,
                error: 'UID é obrigatório',
                isPro: false,
                credits: 0,
                proExpiresAt: null,
                daysLeft: 0,
                user: null
            });
        }
        
        // 🔒 Busca todos os dados do usuário
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('is_pro, creditos, pro_expires_at, email, nome, foto_url')
            .eq('uid', uid)
            .maybeSingle();
        
        // Se usuário não existe
        if (!user || error) {
            return res.status(200).json({
                success: false,
                error: 'Usuário não encontrado',
                isPro: false,
                credits: 0,
                proExpiresAt: null,
                daysLeft: 0,
                user: null
            });
        }
        
        let isPro = user.is_pro || false;
        let proExpiresAt = user.pro_expires_at || null;
        let daysLeft = 0;
        
        // 🔥 Verifica se é o email fixo PRO (força PRO)
        if (user.email === PRO_FIXED_EMAIL) {
            isPro = true;
            // Se não tiver data de expiração, coloca 365 dias
            if (!proExpiresAt) {
                proExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            }
            daysLeft = 365;
        }
        
        // Calcula dias restantes (se tiver data de expiração)
        if (isPro && proExpiresAt) {
            const expiresAt = new Date(proExpiresAt);
            const now = new Date();
            daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
        
        // 🔥 Nome do usuário (fallback para email se nome for null)
        const nomeUsuario = user.nome || user.email?.split('@')[0] || 'Usuário';
        
        // 🔥 CORREÇÃO: Retorna o UID do corpo da requisição
        return res.status(200).json({
            success: true,
            isPro: isPro,
            credits: user.creditos || 0,
            proExpiresAt: proExpiresAt,
            daysLeft: daysLeft,
            user: {
                uid: uid, // 🔥 Usa o UID da requisição
                nome: nomeUsuario,
                email: user.email,
                foto: user.foto_url || null
            }
        });
        
    } catch (error: any) {
        console.error('❌ Erro em /api/user/status:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor',
            isPro: false,
            credits: 0,
            proExpiresAt: null,
            daysLeft: 0,
            user: null
        });
    }
}
