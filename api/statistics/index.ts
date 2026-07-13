// ============================================
// CAMINHO: api/statistics/index.ts
// ============================================
// ROTA HTTP PARA ESTATÍSTICAS - ÚNICA SERVERLESS FUNCTION
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StatisticsEngine } from './engine/StatisticsEngine.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed. Use GET.' 
        });
    }

    try {
        const { lottery, period = 'all' } = req.query;

        if (!lottery || typeof lottery !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'Parâmetro "lottery" é obrigatório' 
            });
        }

        console.log(`📊 /api/statistics chamado: lottery=${lottery}, period=${period}`);

        const engine = new StatisticsEngine();
        const result = await engine.calculate(lottery, period as string);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('❌ Erro em /api/statistics:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao calcular estatísticas'
        });
    }
}
