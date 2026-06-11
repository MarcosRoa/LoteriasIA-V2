import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: ws } }
);

export default async function handler(req, res) {
    const uid = req.query.uid || 'teste123';
    
    try {
        let { data: user, error } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .maybeSingle();
        
        if (!user && !error) {
            const { data: newUser } = await supabase
                .from('usuarios')
                .insert({ uid, creditos: 5, is_pro: false })
                .select()
                .single();
            user = newUser;
        }
        
        res.status(200).json({ success: true, credits: user.creditos, isPro: user.is_pro });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
