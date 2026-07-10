// ============================================
// CAMINHO: api/proxy-ia/index.js
// ============================================
// PROXY PARA CHAMAR O RAILWAY
// Mantém a API_SECRET_KEY segura no backend
// ============================================

const API_SECRET_KEY = process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura';
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app';

export default async function handler(req, res) {
    // ============================================
    // 1. CORS
    // ============================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ============================================
    // 2. Pegar a ação da URL
    // ============================================
    const { action } = req.query; // generate, analyze, predict
    if (!action) {
        return res.status(400).json({ 
            success: false, 
            error: 'Parâmetro "action" é obrigatório (generate, analyze, predict)' 
        });
    }

    // ============================================
    // 3. Validar autenticação do usuário (Firebase)
    // ============================================
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            error: 'Token de autenticação não fornecido' 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // ============================================
        // 4. Validar token com Firebase
        // ============================================
        const user = await verifyFirebaseToken(token);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token inválido ou expirado' 
            });
        }

        console.log(`👤 Usuário: ${user.email} | UID: ${user.uid}`);

        // ============================================
        // 5. Encaminhar para o Railway
        // ============================================
        const railwayResponse = await fetch(
            `${RAILWAY_URL}/api/${action}`,
            {
                method: req.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_SECRET_KEY,
                    'x-user-id': user.uid,
                    'x-user-email': user.email || '',
                    'x-user-plan': user.isPro ? 'pro' : 'free'
                },
                body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
            }
        );

        const data = await railwayResponse.json();

        // ============================================
        // 6. Retornar resposta
        // ============================================
        res.status(railwayResponse.status).json(data);

    } catch (error) {
        console.error('❌ Erro no proxy-ia:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao processar requisição'
        });
    }
}

// ============================================
// FUNÇÃO PARA VERIFICAR TOKEN FIREBASE
// ============================================
async function verifyFirebaseToken(token) {
    try {
        // Usar Firebase Admin SDK (se disponível)
        // Ou fazer uma requisição para o Firebase Auth
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            }
        );

        const data = await response.json();
        if (!data.users || data.users.length === 0) {
            return null;
        }

        const user = data.users[0];
        return {
            uid: user.localId,
            email: user.email,
            isPro: false // Você pode buscar do seu banco depois
        };
    } catch (error) {
        console.error('❌ Erro ao verificar token:', error);
        return null;
    }
}
