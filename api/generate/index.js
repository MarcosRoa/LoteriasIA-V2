// ============================================
// CAMINHO: api/generate/index.js
// ============================================
// ORQUESTRADOR DE GERAÇÃO (Vercel)
// VERSÃO 3.2 - CORRIGIDA
// ============================================

import { GenerateService } from '../../services/GenerateService';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const {
            lotteryType,
            count = 1,
            method = 'hybrid',
            filters = {},
            extraNumbers
        } = req.body;

        // ✅ UID vem do Firebase (header)
        const uid = req.headers['x-user-id'] || req.body?.uid;

        if (!uid) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }

        // ✅ REMOVIDO: isPro do body (não confiar no frontend)

        const generateService = new GenerateService();
        
        const result = await generateService.generateGames({
            uid,
            lottery: lotteryType,
            quantity: count,
            method,
            extraNumbers: extraNumbers || 0,
            filters
            // ❌ NÃO ENVIAR isPro
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
        // ✅ Tratar erros tipados
        if (error.name === 'InsufficientCreditsError') {
            return res.status(400).json({
                success: false,
                error: error.message,
                credits: error.credits,
                needed: error.needed
            });
        }

        if (error.name === 'InvalidLotteryError') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        console.error('❌ Erro no /api/generate:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao gerar jogos'
        });
    }
}
