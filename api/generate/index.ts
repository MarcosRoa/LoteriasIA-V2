import { env } from '../../core/config/env';

export default async function handler(req, res) {
    return res.status(200).json({
        node: env.nodeEnv,
        railway: env.railwayUrl,
        hasSupabaseUrl: !!env.supabaseUrl,
        hasServiceKey: !!env.supabaseServiceKey
    });
}
