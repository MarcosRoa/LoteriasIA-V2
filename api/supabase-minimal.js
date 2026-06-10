// api/supabase-minimal.js
const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
    // Configuração MÍNIMA possível
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    try {
        // Teste mais simples possível
        const result = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });
        
        res.status(200).json({
            step: 1,
            error: result.error ? result.error.message : null,
            hasError: !!result.error
        });
        
    } catch (error) {
        res.status(200).json({
            step: 2,
            error: error.message,
            stack: error.stack
        });
    }
}
