import { env } from '../../core/config/env';

export default async function handler(req, res) {
    return res.status(200).json({
        nodeEnv: env.nodeEnv,
        railwayUrl: env.railwayUrl,
        hasSupabaseUrl: Boolean(env.supabaseUrl),
        hasServiceKey: Boolean(env.supabaseServiceKey)
    });
}
