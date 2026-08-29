// api/generate/index.ts
// ============================================
// ORQUESTRADOR DE GERAÇÃO (Vercel)  29/08/2026
// VERSÃO 3.3 - CORRIGIDA (SEM FIREBASE ADMIN)
// ============================================

import { GenerateService } from '../../services/GenerateService.js';
import { authenticate } from '../../middleware/auth.js';
import { rateLimit } from '../../middleware/rateLimit.js';

export default async function handler(req, res) {
    // ============================================
    // 1. CORS
    // ============================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 
        'Content-Type, Authorization, X-User-Id, X-User-Email, X-User-Name'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // ============================================
        // 2. AUTENTICAÇÃO (SIMPLES)
        // ============================================
        const auth = await authenticate(req, res);
        if (!auth) return; // Já enviou 401
        
        const uid = auth.uid;
        
        // ============================================
        // 3. RATE LIMIT
        // ============================================
        if (!rateLimit(uid, 30, 60000)) {
            return res.status(429).json({
                success: false,
                error: 'Muitas requisições. Aguarde alguns segundos.'
            });
        }
        
        // ============================================
        // 4. EXTRAIR DADOS DA REQUISIÇÃO (CORRIGIDO)
        // ============================================
        const body = req.body ?? {};  // ✅ Evita erro se body for undefined
        
        const {
            lotteryType,
            count = 1,
            method = 'hybrid',
            filters = {},
            extraNumbers
        } = body;
        
        if (!lotteryType) {
            return res.status(400).json({
                success: false,
                error: 'Tipo de loteria é obrigatório'
            });
        }
        
        // ============================================
        // 5. CHAMAR GENERATE SERVICE
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
        // 6. RETORNAR RESPOSTA
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
        /// ✅ TRATAMENTO CORRETO PARA QUALQUER TIPO DE ERRO
        let message = 'Erro desconhecido';
        
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error && typeof error === 'object') {
            // ✅ Se for um objeto, tenta extrair a mensagem
            message = (error as any).message || (error as any).error || JSON.stringify(error);
        }
        
        console.error('❌ Erro no /api/generate:', message);
        
        if (message.includes('Saldo insuficiente') || 
            message.includes('Loteria inválida')) {
            return res.status(400).json({
                success: false,
                error: message
            });
        }
        
        return res.status(500).json({
            success: false,
            error: message || 'Erro ao gerar jogos'
        });
    }
}
