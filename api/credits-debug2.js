// api/credits-debug2.js
const { createClient } = require('@supabase/supabase-js');

export default async function handler(req, res) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const uid = req.query.uid || 'teste123';
    
    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .maybeSingle();
        
        if (error) throw error;
        
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
            
            if (insertError) throw insertError;
            
            return res.status(200).json({
                success: true,
                message: 'Usuário criado!',
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
