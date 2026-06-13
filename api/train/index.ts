// api/train/index.ts
// api/train/index.ts - VERSÃO CORRIGIDA
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { AdvancedLotteryAI } from '../../core/ia/AdvancedLotteryAI';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// [MESMA CONFIGURAÇÃO DE LOTTERY_CONFIGS...]

function processarCSV(texto: string, config: any): { dados: number[][]; datas: string[] } {
    // [mesma função de antes...]
}

function filtrarPorPeriodo(dados: number[][], datas: string[], anos: number | string): number[][] {
    // [mesma função de antes...]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { lottery, period = 'all', uid } = req.body;
    
    if (!lottery) {
        return res.status(400).json({ error: 'Loteria é obrigatória' });
    }
    
    const config = LOTTERY_CONFIGS[lottery];
    if (!config) {
        return res.status(400).json({ error: 'Loteria inválida' });
    }
    
    try {
        const baseUrl = process.env.VERCEL_URL || 'loterias-ia.vercel.app';
        const csvUrl = `https://${baseUrl}/csv/${lottery}.csv`;
        
        let dadosFiltrados: number[][] = [];
        let totalDados = 0;
        let confianca = 0;
        
        try {
            const response = await fetch(csvUrl);
            if (response.ok) {
                const csvText = await response.text();
                const { dados, datas } = processarCSV(csvText, config);
                dadosFiltrados = filtrarPorPeriodo(dados, datas, period);
                totalDados = dadosFiltrados.length;
                
                if (totalDados >= 10) {
                    const aiConfig = {
                        nome: config.nome,
                        maxNumero: config.maxNumero,
                        numerosPorJogo: config.numerosPadrao,
                        incluirZero: config.incluirZero,
                        temDispersao: config.temDispersao
                    };
                    
                    const ai = new AdvancedLotteryAI(dadosFiltrados, aiConfig);
                    const treinou = ai.treinar();
                    confianca = treinou ? ai.confianca : 0;
                }
            }
        } catch (e) {
            console.log(`CSV não encontrado para ${lottery}`);
        }
        
        return res.status(200).json({
            success: true,
            trained: totalDados >= 10,
            confidence: confianca,
            totalDataPoints: totalDados,
            period: period,
            lottery: config.nome,
            message: totalDados >= 10 ? `IA treinada com ${totalDados} concursos` : `Dados insuficientes (${totalDados}/10)`
        });
        
    } catch (error: any) {
        console.error('Erro no treinamento:', error);
        return res.status(500).json({ error: error.message });
    }
}
