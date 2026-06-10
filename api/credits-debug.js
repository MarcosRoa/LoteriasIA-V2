// api/credits-debug.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const uid = req.query.uid || 'teste123';
    
    try {
        // Teste 1: Verificar se a tabela existe
        const { data: tableCheck, error: tableError } = await supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true });
        
        if (tableError) {
            return res.status(500).json({
                step: 'table_check',
                error: tableError.message,
                code: tableError.code
            });
        }
        
        // Teste 2: Buscar usuário específico (maybeSingle)
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .maybeSingle();
        
        if (userError) {
            return res.status(500).json({
                step: 'user_fetch',
                error: userError.message
            });
        }
        
        // Teste 3: Se não existe, tentar criar
        if (!user) {
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid: uid,
                    nome: 'Teste',
                    email: `${uid}@teste.com`,
                    creditos: 5,
                    is_pro: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('creditos, is_pro, email')
                .single();
            
            if (insertError) {
                return res.status(500).json({
                    step: 'user_create',
                    error: insertError.message
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Usuário criado com sucesso!',
                credits: newUser.creditos,
                isPro: newUser.is_pro
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Usuário encontrado!',
            credits: user.creditos,
            isPro: user.is_pro
        });
        
    } catch (error) {
        return res.status(500).json({
            step: 'catch_all',
            error: error.message,
            stack: error.stack
        });
    }
}
