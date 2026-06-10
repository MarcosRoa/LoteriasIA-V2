// api/test-env.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Retornar informações sobre as variáveis de ambiente
    res.status(200).json({
        supabase_url_exists: !!process.env.SUPABASE_URL,
        supabase_url_length: process.env.SUPABASE_URL?.length || 0,
        supabase_url_prefix: process.env.SUPABASE_URL?.substring(0, 30) || 'não definida',
        
        supabase_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabase_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        supabase_key_prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'não definida',
        
        node_env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
}
