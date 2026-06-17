// api/user/history.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const uid = req.query.uid as string;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!uid) {
        return res.status(400).json({ error: 'UID é obrigatório' });
    }
    
    try {
        const { data: history, error } = await supabase
            .from('historico_palpites')
            .select('*')
            .eq('usuario_uid', uid)
            .order('data', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        
        // Formatar os dados para o app
        const formattedHistory = history?.map((item: any) => ({
            id: item.id,
            loteria: item.loteria,
            data: item.data,
            jogos: item.jogos || [],
            filtros: item.filtros || item.modo || 'IA Especialista',
            quantidade_numeros: item.quantidade_numeros || 0,
            extras: item.extras || null,
            meses: item.meses || null,
            times: item.times || null
        })) || [];
        
        return res.status(200).json({
            success: true,
            history: formattedHistory
        });
        
    } catch (error: any) {
        console.error('Erro ao buscar histórico:', error);
        return res.status(500).json({ error: error.message });
    }
}
