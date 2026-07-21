// ============================================
// CAMINHO: api/generate/index.js
// ============================================
// ORQUESTRADOR COMPLETO (Vercel = Negócio, Railway = IA)
// VERSÃO 3.3 - CORRIGIDA
// ============================================

import { GenerateService } from '../../services/GenerateService';

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
        console.log('📥 /api/generate (orquestrador) chamado');

        // ============================================
        // 1. EXTRAIR DADOS
        // ============================================
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

        // ============================================
        // 2. CHAMAR GENERATE SERVICE
        // ============================================
        const generateService = new GenerateService();
        
        const result = await generateService.generateGames({
            uid,
            lottery: lotteryType,
            quantity: count,
            method,
            extraNumbers: extraNumbers || 0,
            filters
        });

        // ============================================
        // 3. RETORNAR RESPOSTA
        // ============================================
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
        
        // ✅ Erros de negócio (400)
        if (error.message?.includes('Saldo insuficiente')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        if (error.message?.includes('Loteria inválida')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // ✅ Erros de servidor (500)
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao gerar jogos'
        });
    }
}
