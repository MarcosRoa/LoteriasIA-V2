import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Verificar token (simplificado - em produção use JWT)
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const [usuarios, historico, transacoes] = await Promise.all([
            supabase.from('usuarios').select('*').order('created_at', { ascending: false }),
            supabase.from('historico_palpites').select('*').order('data', { ascending: false }).limit(100),
            supabase.from('transacoes').select('*').order('data', { ascending: false }).limit(100)
        ]);
        
        if (usuarios.error) throw usuarios.error;
        if (historico.error) throw historico.error;
        if (transacoes.error) throw transacoes.error;
        
        return res.status(200).json({
            usuarios: usuarios.data || [],
            historico: historico.data || [],
            transacoes: transacoes.data || []
        });
        
    } catch (error: any) {
        console.error('Erro admin:', error);
        return res.status(500).json({ error: error.message });
    }
}
