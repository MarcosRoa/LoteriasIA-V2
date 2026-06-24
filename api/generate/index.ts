// api/generate/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { AdvancedLotteryAI } from '../../core/ia/AdvancedLotteryAI';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LOTTERY_CONFIGS: Record<string, { 
    nome: string; 
    maxNumero: number; 
    numerosPadrao: number; 
    incluirZero: boolean; 
    temDispersao: boolean;
    minNumeros: number;
    maxNumeros: number;
}> = {
    megasena: { nome: 'Mega-Sena', maxNumero: 60, numerosPadrao: 6, incluirZero: false, temDispersao: true, minNumeros: 6, maxNumeros: 20 },
    quina: { nome: 'Quina', maxNumero: 80, numerosPadrao: 5, incluirZero: false, temDispersao: true, minNumeros: 5, maxNumeros: 15 },
    lotofacil: { nome: 'Lotofácil', maxNumero: 25, numerosPadrao: 15, incluirZero: false, temDispersao: true, minNumeros: 15, maxNumeros: 20 },
    lotomania: { nome: 'Lotomania', maxNumero: 99, numerosPadrao: 50, incluirZero: true, temDispersao: true, minNumeros: 50, maxNumeros: 50 },
    duplasena: { nome: 'Dupla Sena', maxNumero: 50, numerosPadrao: 6, incluirZero: false, temDispersao: true, minNumeros: 6, maxNumeros: 15 },
    timemania: { nome: 'Timemania', maxNumero: 80, numerosPadrao: 10, incluirZero: false, temDispersao: true, minNumeros: 10, maxNumeros: 10 },
    milionaria: { nome: '+Milionária', maxNumero: 50, numerosPadrao: 6, incluirZero: false, temDispersao: true, minNumeros: 6, maxNumeros: 12 },
    loteca: { nome: 'Loteca', maxNumero: 3, numerosPadrao: 14, incluirZero: true, temDispersao: false, minNumeros: 14, maxNumeros: 14 },
    diadesorte: { nome: 'Dia de Sorte', maxNumero: 31, numerosPadrao: 7, incluirZero: false, temDispersao: true, minNumeros: 7, maxNumeros: 15 },
    supersete: { nome: 'Super Sete', maxNumero: 9, numerosPadrao: 7, incluirZero: true, temDispersao: true, minNumeros: 7, maxNumeros: 21 }
};

// ============================================
// FUNÇÕES DE PROCESSAMENTO DE CSV E FILTRO
// ============================================

function processarCSV(texto: string, config: any): { dados: number[][]; datas: string[] } {
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    const dados: number[][] = [];
    const datas: string[] = [];
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
        
        const dataStr = colunas[dataIndex].trim();
        let dataFormatada = dataStr;
        if (dataStr.includes('-')) {
            const [a, m, d] = dataStr.split('-');
            dataFormatada = `${d}/${m}/${a}`;
        }
        datas.push(dataFormatada);
        
        const numeros: number[] = [];
        for (let j = dataIndex + 1; j < colunas.length; j++) {
            let valor = colunas[j]?.trim();
            if (valor === '' || valor === undefined) continue;
            
            if (config.nome === 'Timemania' && isNaN(parseInt(valor))) {
                continue;
            }
            
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
    
    return { dados, datas };
}

function getDataCortePorAnos(datas: string[], anos: number): Date | null {
    let ultimaData: Date | null = null;
    for (let i = datas.length - 1; i >= 0; i--) {
        const dataStr = datas[i];
        if (dataStr) {
            const partes = dataStr.split('/');
            if (partes.length === 3) {
                const data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (!isNaN(data.getTime())) {
                    ultimaData = data;
                    break;
                }
            }
        }
    }
    
    if (!ultimaData) return null;
    return new Date(ultimaData.getFullYear() - anos, ultimaData.getMonth(), ultimaData.getDate());
}

function filtrarPorPeriodo(dados: number[][], datas: string[], period: string | number): number[][] {
    if (period === 'all' || dados.length === 0) return dados;
    
    const anos = typeof period === 'number' ? period : parseInt(period as string);
    if (isNaN(anos)) return dados;
    
    const dataCorte = getDataCortePorAnos(datas, anos);
    if (!dataCorte) return dados;
    
    const dadosFiltrados: number[][] = [];
    for (let i = 0; i < dados.length; i++) {
        const dataStr = datas[i];
        if (dataStr) {
            const partes = dataStr.split('/');
            if (partes.length === 3) {
                const dataConcurso = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (dataConcurso >= dataCorte) {
                    dadosFiltrados.push(dados[i]);
                }
            }
        }
    }
    
    return dadosFiltrados;
}

// ============================================
// FUNÇÃO: gerarJogo
// ============================================

function gerarJogo(
    dadosHistoricos: number[][],
    config: any,
    modo: string,
    numerosPorJogo: number,
    seed: number,
    dispersao: number = 15
): number[] {
    
    const aiConfig = {
        nome: config.nome,
        maxNumero: config.maxNumero,
        numerosPorJogo: numerosPorJogo,
        incluirZero: config.incluirZero,
        temDispersao: config.temDispersao
    };
    
    if (dadosHistoricos.length < 10 || modo === 'aleatorio_puro') {
        // Aleatório puro
        const numeros = new Set<number>();
        const min = config.incluirZero ? 0 : 1;
        const max = config.maxNumero;
        while (numeros.size < numerosPorJogo) {
            numeros.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(numeros).sort((a, b) => a - b);
    }
    
    const ai = new AdvancedLotteryAI(dadosHistoricos, aiConfig);
    ai.treinar();
    
    let usarDispersao = config.temDispersao;
    let windowDispersao = dispersao;
    
    // Se o modo for aleatorio_inteligente ou probabilistico, não usa dispersão
    if (modo === 'aleatorio_inteligente' || modo === 'probabilistico') {
        usarDispersao = false;
        windowDispersao = 0;
    }
    
    return ai.predizerIAEspecialista(
        numerosPorJogo, 
        usarDispersao, 
        windowDispersao, 
        seed
    );
}

// ============================================
// MAIN HANDLER
// ============================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { uid, lottery, quantity, mode = 'ia_especialista', extraNumbers, period = 'all', dispersao = 15 } = req.body;
    
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
        const isPro = isProFixed || user.is_pro;
        
        const custoPorJogo = isPro ? 2 : 3;
        const custoTotal = quantity * custoPorJogo;
        
        if (!isProFixed && custoTotal > 0 && user.creditos < custoTotal) {
            return res.status(402).json({ error: 'Saldo insuficiente' });
        }
        
        // Carregar CSV
        let dadosHistoricos: number[][] = [];
        let datas: string[] = [];
        
        try {
            const host = req.headers.host;
            const protocol = host?.includes('localhost') ? 'http' : 'https';
            const csvUrl = `${protocol}://${host}/csv/${lottery}.csv`;
            
            const response = await fetch(csvUrl);
            if (response.ok) {
                const csvText = await response.text();
                const resultado = processarCSV(csvText, config);
                dadosHistoricos = resultado.dados;
                datas = resultado.datas;
                console.log(`📊 ${config.nome}: ${dadosHistoricos.length} concursos carregados`);
            }
        } catch (e) {
            console.log('⚠️ Erro ao carregar CSV:', e);
        }
        
        // ✅ APLICAR FILTRO DE PERÍODO
        if (dadosHistoricos.length > 0 && datas.length > 0 && period !== 'all') {
            dadosHistoricos = filtrarPorPeriodo(dadosHistoricos, datas, period);
            console.log(`📊 Período ${period} ano(s): ${dadosHistoricos.length} concursos`);
        }
        
        // Gerar jogos
        const jogos: number[][] = [];
        for (let i = 0; i < quantity; i++) {
            const jogo = gerarJogo(
                dadosHistoricos,
                config,
                mode,
                numerosPorJogo,
                i,
                dispersao
            );
            jogos.push(jogo);
        }
        
        // Atualizar créditos
        let novoSaldo = user.creditos;
        if (custoTotal > 0 && !isProFixed) {
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
                    filtros: `Período: ${period}, Dispersão: ${dispersao}`,
                    created_at: new Date().toISOString()
                });
        }
        
        return res.status(200).json({
            success: true,
            games: jogos,
            creditsSpent: custoTotal,
            creditsRemaining: novoSaldo,
            mode: mode,
            iaUsed: dadosHistoricos.length >= 10 && mode !== 'aleatorio_puro'
        });
        
    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
