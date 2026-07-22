// api/test-auth.js
// ============================================
// ENDPOINT DE TESTE PARA AUTENTICAÇÃO
// ============================================

import { authenticate, isFirebaseAdminReady } from '../middleware/auth.js';

export default async function handler(req, res) {
    try {
        // ============================================
        // 1. TESTAR AUTENTICAÇÃO
        // ============================================
        const auth = await authenticate(req, res);
        if (!auth) return; // Já enviou 401
        
        // ============================================
        // 2. RETORNAR INFORMAÇÕES
        // ============================================
        return res.status(200).json({
            success: true,
            message: 'Autenticação funcionando!',
            uid: auth.uid,
            method: auth.method,
            firebaseAdminReady: isFirebaseAdminReady(),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({
            success: false,
            error: message
        });
    }
}
