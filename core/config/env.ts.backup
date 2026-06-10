// core/config/env.ts
export const env = {
    // Ambiente
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
    
    // Supabase
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    
    // Firebase
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    },
    
    // Mercado Pago
    mercadopago: {
        webhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
    },
    
    // Segurança
    corsAllowedOrigin: process.env.CORS_ALLOWED_ORIGIN || 'https://loterias-ia.vercel.app',
    
    // Configurações
    defaultCredits: 5,
    proCredits: 100,
    proFixedEmail: 'mresquadriasaluminio@gmail.com',
    costPerGame: 3,
    proCostPerGame: 2
};

// Validar variáveis obrigatórias
if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}
