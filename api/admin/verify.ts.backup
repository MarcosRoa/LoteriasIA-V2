import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { email, password } = req.body;
    
    // Verificar credenciais (via variáveis de ambiente)
    if (email !== ADMIN_EMAIL) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Aqui você pode usar bcrypt para comparar hash
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Gerar token temporário (opcional)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    return res.status(200).json({ success: true, token });
}
