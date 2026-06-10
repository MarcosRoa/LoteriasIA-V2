// api/supabase-test2.js
const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
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
            error: error.message
        });
    }
}
