// api/user/transactions.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const auth = await authenticate(req, res);
    if (!auth) return;
    
    const { uid } = auth;
    
    const dias = parseInt(req.query.dias as string) || 30;
    
    try {
        // Calcular data limite
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);
        
        const { data: transactions, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('usuario_uid', uid)
            .gte('data', dataLimite.toISOString())
            .order('data', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        return res.status(200).json({
            success: true,
            transactions: transactions || []
        });
        
    } catch (error: any) {
        console.error('Erro ao buscar transações:', error);
        return res.status(500).json({ error: error.message });
    }
}
