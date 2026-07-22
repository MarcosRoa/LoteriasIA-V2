// api/generate/index.ts
// ============================================
// ORQUESTRADOR DE GERAÇÃO (Vercel)
// VERSÃO 4.1 - COM CORREÇÕES DE SEGURANÇA
// ============================================

import { authenticate } from '../../middleware/auth.js';
import { rateLimit, RATE_LIMIT } from '../../middleware/rateLimit.js';
import { GenerateService } from '../../services/GenerateService.js';

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
        // 2. AUTENTICAÇÃO (HÍBRIDA)
        // ============================================
        const auth = await authenticate(req, res);
        if (!auth) return; // Já enviou 401
        
        const { uid, method: authMethod } = auth;
        console.log(`🔐 Usuário autenticado: ${uid} (método: ${authMethod})`);
        
        // ============================================
        // 3. RATE LIMIT (USANDO CONSTANTES)
        // ============================================
        if (!rateLimit(uid, RATE_LIMIT.MAX_REQUESTS, RATE_LIMIT.WINDOW_MS)) {
            return res.status(429).json({
                success: false,
                error: `Muitas requisições. Aguarde ${RATE_LIMIT.WINDOW_MS / 1000} segundos.`
            });
        }
        
        // ============================================
        // 4. EXTRAIR DADOS DA REQUISIÇÃO (COM SEGURANÇA)
        // ============================================
        // ✅ Evitar erro se req.body for undefined
        const body = req.body ?? {};
        
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
            explanation: result.explanation || [],
            _authMethod: authMethod // debug
        });
        
    } catch (error) {
        // ✅ Tratamento correto para unknown
        const message = error instanceof Error ? error.message : String(error);
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
