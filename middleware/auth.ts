// middleware/auth.ts
// ============================================
// AUTENTICAÇÃO SIMPLES (SEM FIREBASE ADMIN)
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

export function authenticate(
    req: VercelRequest,
    res: VercelResponse
): { uid: string } | null {
    
    // ============================================
    // 1. TENTAR X-User-Id (header)
    // ============================================
    const uid = (req.headers['x-user-id'] || req.body?.uid || req.query?.uid) as string;
    
    if (!uid) {
        res.status(401).json({
            success: false,
            error: 'Usuário não autenticado. Envie X-User-Id no header.'
        });
        return null;
    }
    
    // ============================================
    // 2. RETORNAR UID
    // ============================================
    console.log(`🔐 Usuário autenticado: ${uid}`);
    
    return { uid };
}
