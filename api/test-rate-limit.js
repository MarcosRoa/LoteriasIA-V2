// api/test-rate-limit.js
// ============================================
// ENDPOINT DE TESTE PARA RATE LIMIT
// ============================================

import { authenticate } from '../middleware/auth.js';
import { rateLimit, RATE_LIMIT, getRateLimitStatus } from '../middleware/rateLimit.js';

export default async function handler(req, res) {
    try {
        // ============================================
        // 1. AUTENTICAÇÃO
        // ============================================
        const auth = await authenticate(req, res);
        if (!auth) return;
        
        // ============================================
        // 2. RATE LIMIT (5 requisições por minuto para teste)
        // ============================================
        const TEST_LIMIT = 5;
        const TEST_WINDOW = 60000;
        
        if (!rateLimit(`test_${auth.uid}`, TEST_LIMIT, TEST_WINDOW)) {
            const status = getRateLimitStatus(`test_${auth.uid}`);
            return res.status(429).json({
                success: false,
                error: `Rate limit excedido (${TEST_LIMIT}/min)`,
                remaining: status?.remaining ?? 0,
                resetIn: status?.resetIn ?? 0
            });
        }
        
        const status = getRateLimitStatus(`test_${auth.uid}`);
        
        // ============================================
        // 3. RETORNAR SUCESSO
        // ============================================
        return res.status(200).json({
            success: true,
            message: 'Rate limit passou!',
            remaining: status?.remaining ?? TEST_LIMIT - 1,
            resetIn: status?.resetIn ?? 0
        });
        
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
            success: false,
            error: message
        });
    }
}
