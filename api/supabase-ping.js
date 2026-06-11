// api/supabase-ping.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    // Verificar se as variáveis existem
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
            error: 'Missing environment variables',
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
            message: 'Supabase conectado!',
            userCount: data?.count || 0
        });
        
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            code: error.code
        });
    }
}
