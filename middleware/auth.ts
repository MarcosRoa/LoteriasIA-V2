// middleware/auth.ts
import type { VercelRequest } from '@vercel/node';

export function validateAuth(req: VercelRequest): { isValid: boolean; uid?: string; error?: string } {
    const uid = (req.query.uid || req.headers['x-user-id']) as string;
    
    if (!uid) {
        return { isValid: false, error: 'UID required' };
    }
    
    // Verificar origin
    const origin = req.headers.origin;
    const allowedOrigins = ['https://loterias-ia.vercel.app', 'http://localhost:3000'];
    
    if (origin && !allowedOrigins.includes(origin)) {
        return { isValid: false, error: 'Invalid origin' };
    }
    
    return { isValid: true, uid };
}
