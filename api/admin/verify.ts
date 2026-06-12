// api/admin/verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Credenciais fixas (temporário - para testar)
const ADMIN_EMAIL = 'piamarcos@yahoo.com.br';
const ADMIN_PASSWORD = 'M@rcosroa123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { email, password } = req.body;
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar token simples
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    return res.status(200).json({
        success: true,
        token,
        message: 'Login realizado com sucesso'
    });
}
