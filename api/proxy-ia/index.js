// ============================================
// CAMINHO: api/proxy-ia/index.js
// ============================================
// DEPRECIADO - Manter apenas para compatibilidade
// Use /api/generate em vez disso
// ============================================

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app';
const API_SECRET_KEY = process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ============================================
    // HEALTH CHECK
    // ============================================
    if (req.url === '/health' || req.url === '/proxy-ia/health') {
        return res.status(200).json({
            success: true,
            status: 'OK',
            service: 'Proxy IA (DEPRECIADO)',
            message: 'Use /api/generate em vez disso',
            timestamp: new Date().toISOString()
        });
    }

    // ============================================
    // APENAS /generate
    // ============================================
    if (req.url?.includes('/generate') || req.url?.includes('/generate')) {
        try {
            console.log('📥 /proxy-ia/generate (depreciado) chamado');

            const response = await fetch(`${RAILWAY_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_SECRET_KEY,
                    'x-user-id': req.body?.uid || req.headers['x-user-id'] || '',
                    'x-user-email': req.headers['x-user-email'] || '',
                    'x-user-name': req.headers['x-user-name'] || ''
                },
                body: JSON.stringify(req.body || {})
            });

            const data = await response.json();
            return res.status(response.status).json(data);

        } catch (error) {
            console.error('❌ Erro no proxy-ia (depreciado):', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Erro ao processar geração'
            });
        }
    }

    // ============================================
    // OUTRAS ROTAS - RETORNA 404
    // ============================================
    return res.status(404).json({
        success: false,
        error: 'Rota não encontrada. Use /api/generate para IA ou /api/user/status para usuário.'
    });
}
