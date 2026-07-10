// ============================================
// CAMINHO: api/generate/index.js
// ============================================
// REDIRECIONA PARA O RAILWAY (APENAS IA)
// ============================================

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app';
const API_SECRET_KEY = process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        console.log('📥 /api/generate (proxy) chamado');
        console.log('📤 Redirecionando para:', `${RAILWAY_URL}/api/generate`);

        // Buscar o token do header
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        const response = await fetch(`${RAILWAY_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_SECRET_KEY,
                'x-user-id': req.body?.uid || req.headers['x-user-id'] || '',
                'x-user-email': req.headers['x-user-email'] || '',
                'x-user-name': req.headers['x-user-name'] || '',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(req.body || {})
        });

        const data = await response.json();

        console.log('✅ Resposta do Railway recebida:', response.status);

        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Erro no proxy /api/generate:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao processar geração'
        });
    }
}
