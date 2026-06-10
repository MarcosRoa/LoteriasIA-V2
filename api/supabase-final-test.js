// api/supabase-final-test.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Usando as variáveis de ambiente (que você disse que estão corretas)
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const uid = req.query.uid || 'teste-v2-123';
    
    try {
        // TESTE 1: Tentar buscar um usuário
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('id, uid, creditos, is_pro, email')
            .eq('uid', uid)
            .maybeSingle();
        
        // TESTE 2: Se não existir, criar
        if (!user && !error) {
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid: uid,
                    nome: 'Usuário Teste V2',
                    email: `${uid}@teste.com`,
                    creditos: 10,
                    is_pro: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id, uid, creditos, is_pro, email')
                .single();
            
            if (insertError) throw insertError;
            user = newUser;
        } else if (error) {
            throw error;
        }
        
        // Sucesso!
        res.status(200).json({
            success: true,
            message: 'Supabase funcionando!',
            user: {
                uid: user.uid,
                credits: user.creditos,
                isPro: user.is_pro,
                email: user.email
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
        });
    }
}
