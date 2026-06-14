// api/credits/index.ts - VERSÃO CORRIGIDA (com tratamento de erro)
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
    
    // Pega UID do query ou header
    const uid = (req.query.uid || req.headers['x-user-id']) as string;
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    // Pega dados do header (enviados pelo app)
    const email = (req.headers['x-user-email'] as string) || `${uid}@temp.com`;
    const nome = (req.headers['x-user-name'] as string) || email.split('@')[0];
    
    console.log('📝 Recebido:', { uid, email, nome });
    
    try {
        // Buscar usuário existente
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .maybeSingle();
        
        // Se houver erro na consulta, lançar exceção
        if (error) {
            console.error('❌ Erro na consulta:', error);
            throw error;
        }
        
        // Se não existe, criar
        if (!user) {
            console.log('📝 Criando novo usuário:', { uid, nome, email });
            
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid,
                    nome: nome,
                    email: email,
                    creditos: 5,
                    is_pro: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('creditos, is_pro, email, nome')
                .single();
            
            if (insertError) {
                console.error('❌ Erro ao inserir:', insertError);
                throw insertError;
            }
            user = newUser;
            console.log('✅ Usuário criado:', user);
        } 
        // Se existe mas não tem nome ou está vazio, atualizar
        else if (!user.nome || user.nome === '' || user.nome === '-') {
            console.log('📝 Atualizando usuário existente:', { uid, nome, email });
            
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ 
                    nome: nome,
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('uid', uid);
            
            if (updateError) {
                console.error('❌ Erro ao atualizar:', updateError);
                throw updateError;
            }
            
            user.nome = nome;
            user.email = email;
            console.log('✅ Usuário atualizado:', user);
        }
        
        // Verificar email PRO fixo
        const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';
        let credits = user?.creditos || 5;
        let isPro = user?.is_pro || false;
        
        if (email === PRO_FIXED_EMAIL) {
            isPro = true;
            if (credits !== 100) {
                await supabase
                    .from('usuarios')
                    .update({ creditos: 100, is_pro: true })
                    .eq('uid', uid);
                credits = 100;
            }
        }
        
        return res.status(200).json({ 
            success: true, 
            credits, 
            isPro,
            nome: user?.nome,
            email: user?.email
        });
        
    } catch (error: any) {
        console.error('❌ Erro em /api/credits:', error);
        return res.status(500).json({ error: error.message });
    }
}
