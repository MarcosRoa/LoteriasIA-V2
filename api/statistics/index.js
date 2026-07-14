// ============================================
// CAMINHO: api/statistics/index.js
// ============================================
// PROXY PARA ESTATÍSTICAS (Vercel → Railway)
// ============================================

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app';
const API_SECRET_KEY = process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use GET.'
        });
    }

    try {
        const { lottery, period = 'all' } = req.query;

        if (!lottery) {
            return res.status(400).json({
                success: false,
                error: 'Parâmetro "lottery" é obrigatório'
            });
        }

        console.log(`📊 /api/statistics (proxy) chamado: lottery=${lottery}, period=${period}`);

        const response = await fetch(
            `${RAILWAY_URL}/api/statistics?lottery=${lottery}&period=${period}`,
            {
                method: 'GET',
                headers: {
                    'x-api-key': API_SECRET_KEY
                }
            }
        );

        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Erro no proxy /api/statistics:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar estatísticas'
        });
    }
}
