// api/test-supabase-ts.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Primeiro: verificar se as variáveis existem
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
            success: false,
            error: 'Variáveis de ambiente não encontradas',
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey
        });
    }
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        return res.status(200).json({
            success: true,
            message: 'Conexão Supabase OK no TypeScript!',
            userCount: data?.count || 0
        });
        
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
}
