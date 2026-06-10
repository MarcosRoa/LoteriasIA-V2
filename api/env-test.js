// api/env-test.js
export default function handler(req, res) {
    res.status(200).json({
        supabase_url_exists: !!process.env.SUPABASE_URL,
        supabase_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabase_url_length: process.env.SUPABASE_URL?.length || 0,
        supabase_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        node_env: process.env.NODE_ENV
    });
}
