// middleware/auth.ts
// ============================================
// AUTENTICAÇÃO HÍBRIDA (JWT + FALLBACK)
// CORRIGIDO: Firebase Admin, error handling, imports
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// ============================================
// 1. INICIALIZAR FIREBASE ADMIN
// ============================================
function initializeFirebaseAdmin(): boolean {
    // ✅ Já inicializado?
    if (getApps().length > 0) {
        return true;
    }
    
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    // ✅ Validar variáveis de ambiente
    if (!projectId || !clientEmail || !privateKey) {
        console.warn('⚠️ Firebase Admin não configurado. Variáveis de ambiente faltando.');
        return false;
    }
    
    try {
        initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
        console.log('✅ Firebase Admin inicializado com sucesso');
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Erro ao inicializar Firebase Admin:', message);
        return false;
    }
}

// ============================================
// 2. FUNÇÃO PRINCIPAL DE AUTENTICAÇÃO
// ============================================
export async function authenticate(
    req: VercelRequest,
    res: VercelResponse
): Promise<{ uid: string; method: 'jwt' | 'fallback' } | null> {
    
    // ============================================
    // 2.1 TENTAR JWT (MÉTODO SEGURO)
    // ============================================
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        // ✅ Verificar se Firebase Admin está inicializado
        const initialized = initializeFirebaseAdmin();
        
        if (!initialized) {
            console.warn('⚠️ Firebase Admin não inicializado. Pulando validação JWT.');
            // Não retorna erro ainda - tenta fallback
        } else {
            try {
                const decodedToken = await getAuth().verifyIdToken(token);
                console.log(`✅ JWT válido para: ${decodedToken.uid}`);
                
                return {
                    uid: decodedToken.uid,
                    method: 'jwt'
                };
            } catch (error) {
                // ✅ Tratamento correto para unknown
                const message = error instanceof Error ? error.message : String(error);
                console.warn('⚠️ Token JWT inválido:', message);
                // Não retorna erro ainda - tenta fallback
            }
        }
    }
    
    // ============================================
    // 2.2 FALLBACK: X-User-Id ou uid (INSEGURO)
    // ============================================
    const uid = (req.headers['x-user-id'] || req.body?.uid || req.query?.uid) as string;
    
    if (uid) {
        console.warn(
            `⚠️ USANDO FALLBACK INSEGURO para ${uid}. ` +
            `Migre para Authorization: Bearer <token>`
        );
        
        return {
            uid,
            method: 'fallback'
        };
    }
    
    // ============================================
    // 2.3 NENHUM MÉTODO FUNCIONOU
    // ============================================
    res.status(401).json({
        success: false,
        error: 'Autenticação necessária. Use Authorization: Bearer <token>'
    });
    
    return null;
}

// ============================================
// 3. FUNÇÃO PARA VERIFICAR SAÚDE DO FIREBASE
// ============================================
export function isFirebaseAdminReady(): boolean {
    return getApps().length > 0;
}
