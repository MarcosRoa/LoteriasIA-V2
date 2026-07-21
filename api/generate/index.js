// ============================================
// CAMINHO: api/generate/index.js
// ============================================

import { GenerateService } from '../../dist/services/GenerateService.js';

export default async function handler(req, res) {
    // CORS (já está no vercel.json, mas mantido por segurança)
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
        console.log('📥 /api/generate chamado');

        const {
            lotteryType,
            count = 1,
            method = 'hybrid',
            filters = {},
            extraNumbers
        } = req.body;

        const uid = req.headers['x-user-id'] || req.body?.uid;

        if (!uid) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }

        const generateService = new GenerateService();
        
        const result = await generateService.generateGames({
            uid,
            lottery: lotteryType,
            quantity: count,
            method,
            extraNumbers: extraNumbers || 0,
            filters
        });

        return res.status(200).json({
            success: true,
            games: result.games,
            creditsSpent: result.creditsSpent,
            creditsRemaining: result.creditsRemaining,
            mode: result.mode || method,
            engineName: result.engineName || 'IA',
            confidence: result.confidence || 0,
            explanation: result.explanation || []
        });

    } catch (error) {
        console.error('❌ Erro no /api/generate:', error);
        
        if (error.message?.includes('Saldo insuficiente') || 
            error.message?.includes('Loteria inválida')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao gerar jogos'
        });
    }
}
