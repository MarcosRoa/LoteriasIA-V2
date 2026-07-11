// ============================================
// CAMINHO: api/generate/index.js
// ============================================
// REDIRECIONA PARA O RAILWAY (APENAS IA)
// VERSÃO 2.0 - COM TIMEOUT E TRATAMENTO DE ERROS
// ============================================

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://loterias-ia-core-production.up.railway.app';
const API_SECRET_KEY = process.env.RAILWAY_API_KEY || 'loterias-ia-2024-segura';
const TIMEOUT_MS = 20000; // 20 segundos

// ============================================
// LOG CONDICIONAL (apenas em desenvolvimento)
// ============================================
function log(...args) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args);
    }
}

function logError(...args) {
    console.error(...args); // Erros sempre devem ser logados
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        log('📥 /api/generate (proxy) chamado');

        // Buscar o token do header
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        // ============================================
        // 🔥 TIMEOUT COM ABORTCONTROLLER
        // ============================================
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, TIMEOUT_MS);

        log('📤 Redirecionando para:', `${RAILWAY_URL}/api/generate`);
        log('📦 Body:', req.body);

        const response = await fetch(`${RAILWAY_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_SECRET_KEY,
                'x-user-id': req.body?.uid || req.headers['x-user-id'] || '',
                'x-user-email': req.headers['x-user-email'] || '',
                'x-user-name': req.headers['x-user-name'] || '',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify(req.body || {}),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // ============================================
        // 🔥 TRATAMENTO DE RESPOSTA (pode ser HTML)
        // ============================================
        const texto = await response.text();
        let data;

        try {
            data = JSON.parse(texto);
        } catch (e) {
            // Se não for JSON, retorna erro formatado
            logError('⚠️ Railway respondeu com HTML/Texto:', texto.substring(0, 200));
            data = {
                success: false,
                error: 'Erro ao processar resposta da IA',
                raw: texto.substring(0, 200)
            };
            return res.status(502).json(data);
        }

        log('✅ Resposta do Railway recebida:', response.status);

        return res.status(response.status).json(data);

    } catch (error) {
        // ============================================
        // 🔥 TRATAMENTO DE TIMEOUT
        // ============================================
        if (error.name === 'AbortError') {
            logError('⏰ Timeout ao chamar o Railway (20s)');
            return res.status(504).json({
                success: false,
                error: 'Tempo limite excedido. O servidor de IA demorou muito para responder.'
            });
        }

        logError('❌ Erro no proxy /api/generate:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao processar geração'
        });
    }
}
