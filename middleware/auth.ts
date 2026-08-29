// middleware/auth.ts
// ============================================
// AUTENTICAÇÃO REAL - FIREBASE ADMIN  29/08/2026
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// ============================================
// INICIALIZAR FIREBASE ADMIN
// ============================================

if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Credenciais do Firebase Admin não configuradas corretamente'
        );
    }

    initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
}

// ============================================
// AUTENTICAR USUÁRIO
// ============================================

export async function authenticate(
    req: VercelRequest,
    res: VercelResponse
): Promise<{
    uid: string;
    email: string | null;
    name: string | null;
} | null> {

    try {
        // ============================================
        // 1. LER HEADER AUTHORIZATION
        // ============================================

        const authorization = req.headers.authorization;

        if (!authorization) {
            res.status(401).json({
                success: false,
                error: 'Token de autenticação não informado'
            });

            return null;
        }

        // ============================================
        // 2. VALIDAR FORMATO BEARER
        // ============================================

        if (!authorization.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Formato de autenticação inválido'
            });

            return null;
        }

        const token = authorization.substring(7).trim();

        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Token de autenticação vazio'
            });

            return null;
        }

        // ============================================
        // 3. VALIDAR TOKEN FIREBASE
        // ============================================

        const decodedToken = await getAuth().verifyIdToken(token);

        // ============================================
        // 4. UID REAL VEM DO TOKEN VALIDADO
        // ============================================

        const uid = decodedToken.uid;

        if (!uid) {
            res.status(401).json({
                success: false,
                error: 'UID não encontrado no token'
            });

            return null;
        }

        console.log(`🔐 Firebase autenticado: ${uid}`);

        return {
            uid,
            email: decodedToken.email || null,
            name: decodedToken.name || null,
        };

    } catch (error: any) {
        console.error('❌ Falha na autenticação Firebase:', error);

        res.status(401).json({
            success: false,
            error: 'Usuário não autenticado'
        });

        return null;
    }
}
