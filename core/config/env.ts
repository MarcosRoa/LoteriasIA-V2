// core/config/env.ts
// ============================================
// VARIÁVEIS DE AMBIENTE (COM CONSTANTES)
// ============================================

export const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN || 'https://loterias-ia.vercel.app',
    
    // ✅ CRÉDITOS
    defaultCredits: 5,
    proCredits: 100,
    proFixedEmail: 'mresquadriasaluminio@gmail.com',
    costPerGame: 3,
    proCostPerGame: 2,
    
    // ✅ TIMEOUTS
    railwayTimeout: 30000,
    
    // ✅ RAILWAY
    railwayUrl: process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app',
    railwayApiKey: process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura'
};
