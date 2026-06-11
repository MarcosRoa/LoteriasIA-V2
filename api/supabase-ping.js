import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
        transport: ws
    }
});

export default async function handler(req, res) {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        res.status(200).json({ success: true, userCount: data?.count || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
