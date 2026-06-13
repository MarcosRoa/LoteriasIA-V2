// api/generate/index.ts - VERSÃO CORRIGIDA COM 4 MODOS DE IA
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { AdvancedLotteryAI } from '../../core/ia/AdvancedLotteryAI';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LOTTERY_CONFIGS: Record<string, { nome: string; maxNumero: number; numerosPadrao: number; incluirZero: boolean; temDispersao: boolean }> = {
    megasena: { nome: 'Mega-Sena', maxNumero: 60, numerosPadrao: 6, incluirZero: false, temDispersao: true },
    quina: { nome: 'Quina', maxNumero: 80, numerosPadrao: 5, incluirZero: false, temDispersao: true },
    lotofacil: { nome: 'Lotofácil', maxNumero: 25, numerosPadrao: 15, incluirZero: false, temDispersao: true },
    lotomania: { nome: 'Lotomania', maxNumero: 99, numerosPadrao: 50, incluirZero: true, temDispersao: true },
    duplasena: { nome: 'Dupla Sena', maxNumero: 50, numerosPadrao: 6, incluirZero: false, temDispersao: true },
    timemania: { nome: 'Timemania', maxNumero: 80, numerosPadrao: 10, incluirZero: false, temDispersao: true },
    milionaria: { nome: '+Milionária', maxNumero: 50, numerosPadrao: 6, incluirZero: false, temDispersao: true },
    loteca: { nome: 'Loteca', maxNumero: 3, numerosPadrao: 14, incluirZero: true, temDispersao: true },
    diadesorte: { nome: 'Dia de Sorte', maxNumero: 31, numerosPadrao: 7, incluirZero: false, temDispersao: true },
    supersete: { nome: 'Super Sete', maxNumero: 9, numerosPadrao: 7, incluirZero: true, temDispersao: true }
};

// Função para processar CSV e extrair números (para treinamento)
function processarCSV(texto: string, config: any): number[][] {
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    const dados: number[][] = [];
    const sep = linhas[0]?.includes(';') ? ';' : ',';

    for (const linha of linhas) {
        if (!linha.trim()) continue;
        
        let colunas = linha.split(sep);
        while (colunas.length > 0 && colunas[colunas.length - 1].trim() === '') {
            colunas.pop();
        }
        
        if (colunas.length < 2) continue;
        
        let dataIndex = -1;
        for (let j = 0; j < colunas.length; j++) {
            const valor = colunas[j].trim();
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor) || /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
                dataIndex = j;
                break;
            }
        }
        
        if (dataIndex === -1) continue;
        
        const numeros: number[] = [];
        for (let j = dataIndex + 1; j < colunas.length; j++) {
            let valor = colunas[j]?.trim();
            if (valor === '' || valor === undefined) continue;
            
            let num = parseInt(valor);
            if (isNaN(num)) {
                const numStr = valor.toString().trim();
                if (/^\d+$/.test(numStr)) num = parseInt(numStr);
                else continue;
            }
            
            if (num >= (config.incluirZero ? 0 : 1) && num <= config.maxNumero) {
                numeros.push(num);
            }
        }
        
        if (numeros.length >= config.numerosPadrao) {
            const numerosOrdenados = numeros.slice(0, config.numerosPadrao).sort((a, b) => a - b);
            dados.push(numerosOrdenados);
        }
    }
    
    return dados;
}

// Função para gerar jogo baseado no modo
function gerarJogoComIA(dadosHistoricos: number[][], config: any, modo: string, quantidade: number, seed: number, dispersao: number = 15): number[] {
    const aiConfig = {
        nome: config.nome,
        maxNumero: config.maxNumero,
        numerosPorJogo: quantidade,
        incluirZero: config.incluirZero,
        temDispersao: config.temDispersao
    };
    
    const ai = new AdvancedLotteryAI(dadosHistoricos, aiConfig);
    ai.treinar();
    
    switch (modo) {
        case 'ia_especialista':
            return ai.predizerIAEspecialista(quantidade, config.temDispersao, dispersao, seed);
        case 'aleatorio_inteligente':
            // Aleatório inteligente = IA especialista com menos peso
            return ai.predizerIAEspecialista(quantidade, false, 0, seed);
        case 'probabilistico':
            // Probabilístico = baseado apenas em frequência (sem dispersão)
            return ai.predizerIAEspecialista(quantidade, false, 0, seed);
        case 'aleatorio_puro':
        default:
            return ai.predizerAleatorio(quantidade, seed);
    }
}

function gerarJogoAleatorio(config: any, quantidade: number): number[] {
    const numeros = new Set<number>();
    const min = config.incluirZero ? 0 : 1;
    const max = config.maxNumero;
    
    while (numeros.size < quantidade) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        numeros.add(num);
    }
    return Array.from(numeros).sort((a, b) => a - b);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { uid, lottery, quantity, mode = 'ia_especialista', extraNumbers, period = 'all' } = req.body;
    
    if (!uid || !lottery || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const config = LOTTERY_CONFIGS[lottery];
    if (!config) {
        return res.status(400).json({ error: 'Invalid lottery' });
    }
    
    try {
        // Buscar usuário
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .single();
        
        if (userError) throw userError;
        
        const numerosPorJogo = extraNumbers || config.numerosPadrao;
        const PRO_FIXED_EMAIL = 'mresquadriasaluminio@gmail.com';
        const isProFixed = user.email === PRO_FIXED_EMAIL;
        const custoPorJogo = isProFixed ? 0 : (user.is_pro ? 2 : 3);
        const custoTotal = quantity * custoPorJogo;
        
        if (custoTotal > 0 && user.creditos < custoTotal) {
            return res.status(402).json({ error: 'Saldo insuficiente' });
        }
        
        // Carregar dados históricos para IA
        let dadosHistoricos: number[][] = [];
        try {
            const csvUrl = `${process.env.VERCEL_URL || 'https://loterias-ia.vercel.app'}/csv/${lottery}.csv`;
            const response = await fetch(csvUrl);
            if (response.ok) {
                const csvText = await response.text();
                dadosHistoricos = processarCSV(csvText, config);
            }
        } catch (e) {
            console.log(`CSV não encontrado para ${lottery}, usando geração aleatória`);
        }
        
        // Gerar jogos
        const jogos: number[][] = [];
        const dispersao = 15;
        
        for (let i = 0; i < quantity; i++) {
            let jogo: number[];
            
            if (mode === 'ia_especialista' || mode === 'aleatorio_inteligente' || mode === 'probabilistico') {
                if (dadosHistoricos.length >= 10) {
                    jogo = gerarJogoComIA(dadosHistoricos, config, mode, numerosPorJogo, i, dispersao);
                } else {
                    jogo = gerarJogoAleatorio(config, numerosPorJogo);
                }
            } else {
                jogo = gerarJogoAleatorio(config, numerosPorJogo);
            }
            
            jogos.push(jogo);
        }
        
        // Atualizar créditos
        let novoSaldo = user.creditos;
        if (custoTotal > 0) {
            novoSaldo = user.creditos - custoTotal;
            await supabase
                .from('usuarios')
                .update({ creditos: novoSaldo })
                .eq('uid', uid);
        }
        
        // Salvar histórico
        for (const jogo of jogos) {
            await supabase
                .from('historico_palpites')
                .insert({
                    usuario_uid: uid,
                    loteria: lottery,
                    jogos: jogo,
                    modo: mode,
                    quantidade_numeros: numerosPorJogo,
                    custo: custoPorJogo,
                    created_at: new Date().toISOString()
                });
        }
        
        return res.status(200).json({
            success: true,
            games: jogos,
            creditsSpent: custoTotal,
            creditsRemaining: novoSaldo,
            mode: mode,
            iaUsed: dadosHistoricos.length >= 10 && (mode !== 'aleatorio_puro')
        });
        
    } catch (error: any) {
        console.error('Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
