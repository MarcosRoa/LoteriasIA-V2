// api/test-env.js
import { env } from '../core/config/env';

export default async function handler(req, res) {
    try {
        console.log('1. Testando env...');
        return res.status(200).json({ 
            ok: true, 
            env: {
                railwayUrl: env.railwayUrl,
                railwayApiKey: env.railwayApiKey ? 'configurada' : 'não configurada',
                costPerGame: env.costPerGame,
                proCostPerGame: env.proCostPerGame
            }
        });
    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ 
            ok: false, 
            error: error.message,
            stack: error.stack 
        });
    }
}
