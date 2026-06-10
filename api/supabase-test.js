// api/supabase-test.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Tentar conectar com as variáveis de ambiente
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    try {
        // Tentar contar quantos usuários existem (sem filtro)
        const { count, error } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        res.status(200).json({
            success: true,
            message: 'Conexão com Supabase OK!',
            userCount: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.details || 'Sem detalhes'
        });
    }
}
