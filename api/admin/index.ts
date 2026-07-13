// ============================================
// CAMINHO: api/admin/index.ts
// ============================================
// ADMIN - CONSOLIDADO (data + verify)
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇÕES
// ============================================
const ADMIN_EMAIL = 'piamarcos@yahoo.com.br';
const ADMIN_PASSWORD = 'M@rcosroa123';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// HANDLER PRINCIPAL
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    // ============================================
    // ROTA: /api/admin?action=verify (POST)
    // ============================================
    if (action === 'verify' && req.method === 'POST') {
        const { email, password } = req.body;

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ 
                success: false, 
                error: 'Credenciais inválidas' 
            });
        }

        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

        return res.status(200).json({
            success: true,
            token,
            message: 'Login realizado com sucesso'
        });
    }

    // ============================================
    // ROTA: /api/admin?action=data (GET)
    // ============================================
    if (action === 'data' && req.method === 'GET') {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Unauthorized' 
            });
        }

        try {
            const [usuarios, historico, transacoes] = await Promise.all([
                supabase.from('usuarios').select('*').order('created_at', { ascending: false }),
                supabase.from('historico_palpites').select('*').order('data', { ascending: false }).limit(100),
                supabase.from('transacoes').select('*').order('data', { ascending: false }).limit(100)
            ]);

            if (usuarios.error) throw usuarios.error;
            if (historico.error) throw historico.error;
            if (transacoes.error) throw transacoes.error;

            return res.status(200).json({
                success: true,
                usuarios: usuarios.data || [],
                historico: historico.data || [],
                transacoes: transacoes.data || []
            });

        } catch (error: any) {
            console.error('❌ Erro admin:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // ============================================
    // ROTA PADRÃO
    // ============================================
    return res.status(400).json({
        success: false,
        error: 'Ação inválida. Use ?action=verify ou ?action=data'
    });
}
