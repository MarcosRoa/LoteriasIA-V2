// ============================================
// CAMINHO: api/proxy-ia/index.js
// ============================================
// PROXY PARA CHAMAR O RAILWAY
// + ROTAS PARA CRÉDITOS E STATUS PRO (SUPABASE)
// ============================================

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇÕES
// ============================================
const API_SECRET_KEY = process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura';
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app';

// Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// HANDLER PRINCIPAL
// ============================================
export default async function handler(req, res) {
    // ============================================
    // 1. CORS
    // ============================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ============================================
    // 2. VALIDAR TOKEN (obrigatório para todas as rotas)
    // ============================================
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            error: 'Token de autenticação não fornecido' 
        });
    }

    const token = authHeader.split(' ')[1];

    let user;
    try {
        user = await verifyFirebaseToken(token);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token inválido ou expirado' 
            });
        }
    } catch (error) {
        console.error('❌ Erro ao verificar token:', error);
        return res.status(401).json({ 
            success: false, 
            error: 'Erro ao validar token' 
        });
    }

    console.log(`👤 Usuário: ${user.email} | UID: ${user.uid}`);

    // ============================================
    // 3. ROTA: /credits
    // ============================================
    if (req.url?.includes('/credits')) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('creditos')
                .eq('uid', user.uid)
                .single();

            // ✅ Se não encontrar o usuário, retorna 0 (não cria)
            if (error && error.code === 'PGRST116') {
                return res.status(200).json({
                    success: true,
                    credits: 0
                });
            }

            if (error) {
                console.error('❌ Erro ao buscar créditos:', error);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Erro ao buscar créditos' 
                });
            }

            return res.status(200).json({
                success: true,
                credits: data?.creditos || 0
            });
        } catch (error) {
            console.error('❌ Erro ao buscar créditos:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erro ao buscar créditos' 
            });
        }
    }

    // ============================================
    // 4. ROTA: /pro/status
    // ============================================
    if (req.url?.includes('/pro/status')) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('is_pro, pro_expires_at')
                .eq('uid', user.uid)
                .single();

            // ✅ Se não encontrar o usuário, retorna false (não cria)
            if (error && error.code === 'PGRST116') {
                return res.status(200).json({
                    success: true,
                    isPro: false,
                    daysLeft: 0,
                    proExpiresAt: null
                });
            }

            if (error) {
                console.error('❌ Erro ao buscar status PRO:', error);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Erro ao buscar status PRO' 
                });
            }

            const isPro = data?.is_pro || false;
            let daysLeft = 0;
            if (isPro && data?.pro_expires_at) {
                const expiry = new Date(data.pro_expires_at);
                const now = new Date();
                daysLeft = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
            }

            return res.status(200).json({
                success: true,
                isPro,
                daysLeft,
                proExpiresAt: data?.pro_expires_at || null
            });
        } catch (error) {
            console.error('❌ Erro ao buscar status PRO:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erro ao buscar status PRO' 
            });
        }
    }

    // ============================================
    // 5. ROTA: ação (generate, analyze, predict)
    // ============================================
    const { action } = req.query;
    if (!action) {
        return res.status(400).json({ 
            success: false, 
            error: 'Parâmetro "action" é obrigatório (generate, analyze, predict)' 
        });
    }

    try {
        const railwayResponse = await fetch(
            `${RAILWAY_URL}/api/${action}`,
            {
                method: req.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_SECRET_KEY,
                    'x-user-id': user.uid,
                    'x-user-email': user.email || '',
                    'x-user-plan': 'free' // Será atualizado depois
                },
                body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
            }
        );

        const data = await railwayResponse.json();
        res.status(railwayResponse.status).json(data);

    } catch (error) {
        console.error('❌ Erro no proxy-ia:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao processar requisição'
        });
    }
}

// ============================================
// FUNÇÃO PARA VERIFICAR TOKEN FIREBASE
// ============================================
async function verifyFirebaseToken(token) {
    try {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            }
        );

        const data = await response.json();
        if (!data.users || data.users.length === 0) {
            return null;
        }

        const user = data.users[0];
        return {
            uid: user.localId,
            email: user.email,
            isPro: false
        };
    } catch (error) {
        console.error('❌ Erro ao verificar token:', error);
        return null;
    }
}
