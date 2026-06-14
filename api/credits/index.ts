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
    
    // PEGAR DOS HEADERS
    const uid = (req.query.uid || req.headers['x-user-id']) as string;
    const email = (req.headers['x-user-email'] as string);
    const nome = (req.headers['x-user-name'] as string);
    // LOG DE DEBUG - mostra todos os headers recebidos
    console.log('📝 ALL HEADERS:', JSON.stringify(req.headers));
    console.log('📝 X-User-Name:', req.headers['x-user-name']);
    console.log('📝 X-User-Email:', req.headers['x-user-email']);
    console.log('📝 X-User-Id:', req.headers['x-user-id']);
    
    console.log('📝 HEADERS RECEBIDOS:', { uid, email, nome });
    
    if (!uid) return res.status(400).json({ error: 'UID é obrigatório' });
    
    try {
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .maybeSingle();
        
        if (error) throw error;
        
        if (!user) {
            // CRIAR com os dados dos headers
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                    uid,
                    nome: nome || email?.split('@')[0] || 'Usuário',
                    email: email || `${uid}@temp.com`,
                    creditos: 5,
                    is_pro: false
                })
                .select('creditos, is_pro')
                .single();
            
            if (insertError) throw insertError;
            user = newUser;
            console.log('✅ Usuário criado:', { uid, nome, email });
        } else {
            // ATUALIZAR se veio nome/email válido
            if (nome && nome !== '-' && (!user.nome || user.nome === '-')) {
                await supabase
                    .from('usuarios')
                    .update({ nome, email, updated_at: new Date().toISOString() })
                    .eq('uid', uid);
                console.log('✅ Usuário atualizado:', { uid, nome, email });
            }
        }
        
        // PRO fixo
        const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';
        let credits = user.creditos;
        let isPro = user.is_pro;
        
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
        
        //return res.status(200).json({ success: true, credits, isPro });
        return res.status(200).json({
            success: true,
            credits,
            isPro,
            debug: {
                uid,
                nome,
                email,
                xUserName: req.headers['x-user-name'],
                xUserEmail: req.headers['x-user-email'],
                xUserId: req.headers['x-user-id']
            }
        });

        
    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
