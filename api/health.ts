import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../core/database/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    let dbStatus = 'down';
    let latency = 0;
    
    try {
        const start = Date.now();
        const { error } = await supabase
            .from('usuarios')
            .select('count', { count: 'exact', head: true });
        
        latency = Date.now() - start;
        if (!error) dbStatus = 'up';
    } catch (err) {
        console.error('Health check error:', err);
    }
    
    res.status(dbStatus === 'up' ? 200 : 503).json({
        status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: { status: dbStatus, latency },
        api: { status: 'up' }
    });
}
