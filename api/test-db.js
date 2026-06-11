// api/test-db.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Configuração direta (hardcoded para teste)
    const supabaseUrl = 'https://fuiaikymhsjdgdhojjhq.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aWFpa3ltaHNqZGdkaG9qamhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA4MjU1MSwiZXhwIjoyMDkzNjU4NTUxfQ.3sK7xY9qL8mN2pR5tW7xZ1cV4bN6mQ8wE2rT9yU3iA';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Teste 1: Contar usuários
        const { count, error: countError } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            return res.status(500).json({ 
                step: 'count_users', 
                error: countError.message,
                code: countError.code
            });
        }
        
        // Teste 2: Buscar um usuário específico
        const uid = req.query.uid || 'teste123';
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .maybeSingle();
        
        return res.status(200).json({
            success: true,
            userCount: count,
            userFound: !!user,
            userData: user,
            queryUid: uid
        });
        
    } catch (error) {
        return res.status(500).json({
            step: 'catch_all',
            error: error.message,
            stack: error.stack
        });
    }
}
