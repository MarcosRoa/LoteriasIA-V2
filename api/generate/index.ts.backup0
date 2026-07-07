// api/generate/index.ts  02/07/2026
// ============================================
// CAMINHO: api/generate/index.ts
// ============================================
// HANDLER PRINCIPAL - GERAÇÃO DE JOGOS
// MODIFICADO PARA USAR A NOVA ARQUITETURA
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { EngineFactory } from './factory/EngineFactory';
import { BaseEngine, EngineConfig } from './engines/BaseEngine';
import { cacheManager } from './services/CacheManager';

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================

const LOTTERY_CONFIGS: Record<string, any> = {
    megasena: { 
        nome: 'Mega-Sena', 
        maxNumero: 60, 
        numerosPadrao: 6, 
        incluirZero: false, 
        temDispersao: true,
        minNumeros: 6,
        maxNumeros: 20
    },
    quina: { 
        nome: 'Quina', 
        maxNumero: 80, 
        numerosPadrao: 5, 
        incluirZero: false, 
        temDispersao: true,
        minNumeros: 5,
        maxNumeros: 15
    },
    lotofacil: { 
        nome: 'Lotofácil', 
        maxNumero: 25, 
        numerosPadrao: 15, 
        incluirZero: false, 
        temDispersao: true,
        minNumeros: 15,
        maxNumeros: 20
    },
    lotomania: { 
        nome: 'Lotomania', 
        maxNumero: 99, 
        numerosPadrao: 50, 
        incluirZero: true, 
        temDispersao: true,
        minNumeros: 50,
        maxNumeros: 50
    },
    duplasena: { 
        nome: 'Dupla Sena', 
        maxNumero: 50, 
        numerosPadrao: 6, 
        incluirZero: false, 
        temDispersao: true,
        minNumeros: 6,
        maxNumeros: 15
    },
    timemania: { 
        nome: 'Timemania', 
        maxNumero: 80, 
        numerosPadrao: 7, 
        incluirZero: false, 
        temDispersao: true,
        temTime: true,
        minNumeros: 7,
        maxNumeros: 7
    },
    milionaria: { 
        nome: '+Milionária', 
        maxNumero: 50, 
        numerosPadrao: 6, 
        incluirZero: false, 
        temDispersao: true,
        temTrevos: true,
        minNumeros: 6,
        maxNumeros: 12
    },
    loteca: { 
        nome: 'Loteca', 
        maxNumero: 3, 
        numerosPadrao: 14, 
        incluirZero: true, 
        temDispersao: false,
        isLoteca: true,
        minNumeros: 14,
        maxNumeros: 14
    },
    diadesorte: { 
        nome: 'Dia de Sorte', 
        maxNumero: 31, 
        numerosPadrao: 7, 
        incluirZero: false, 
        temDispersao: true,
        temMes: true,
        minNumeros: 7,
        maxNumeros: 15
    },
    supersete: { 
        nome: 'Super Sete', 
        maxNumero: 9, 
        numerosPadrao: 7, 
        incluirZero: true, 
        temDispersao: true,
        isSuperSete: true,
        minNumeros: 7,
        maxNumeros: 21
    }
};

// ============================================
// FUNÇÕES DE PROCESSAMENTO
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
    return ultimaData;
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
// HANDLER PRINCIPAL
// ============================================

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    try {
        const { 
            uid, 
            lottery, 
            quantity, 
            engine = 'hybrid',
            extraNumbers, 
            period = 'all', 
            dispersao = 15 
        } = req.body;
        
        console.log('📥 /api/generate chamado:', { uid, lottery, quantity, engine, extraNumbers, period, dispersao });
        
        // ============================================
        // VALIDAÇÕES
        // ============================================
        
        if (!uid) {
            return res.status(400).json({ error: 'uid é obrigatório' });
        }
        
        if (!lottery) {
            return res.status(400).json({ error: 'lottery é obrigatório' });
        }
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'quantity deve ser maior que 0' });
        }
        
        const config = LOTTERY_CONFIGS[lottery];
        if (!config) {
            return res.status(400).json({ error: `Loteria inválida: ${lottery}` });
        }
        
        // ============================================
        // BUSCAR USUÁRIO
        // ============================================
        
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email, nome')
            .eq('uid', uid)
            .single();
        
        if (userError) {
            console.error('❌ Erro ao buscar usuário:', userError);
            return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
        
        const isPro = user.is_pro || user.email === 'mresquadriasaluminio@gmail.com';
        console.log(`👤 Usuário: ${user.nome || user.email} | PRO: ${isPro} | Créditos: ${user.creditos}`);
        
        // ============================================
        // VERIFICAR QUANTIDADE DE NÚMEROS (PRO)
        // ============================================
        
        const numerosPorJogo = extraNumbers || config.numerosPadrao;
        
        if (isPro && numerosPorJogo > config.maxNumeros) {
            return res.status(400).json({ 
                error: `PRO pode selecionar até ${config.maxNumeros} números` 
            });
        }
        
        if (!isPro && numerosPorJogo > config.numerosPadrao) {
            return res.status(403).json({ 
                error: `Plano FREE: apenas ${config.numerosPadrao} números. Seja PRO para mais!` 
            });
        }
        
        // ============================================
        // VERIFICAR MOTOR (APENAS PRO)
        // ============================================
        
        const motoresPro = ['probability', 'predictive'];
        if (motoresPro.includes(engine) && !isPro) {
            return res.status(403).json({ 
                error: 'Esta IA é exclusiva para assinantes PRO! ⭐' 
            });
        }
        
        // ============================================
        // VERIFICAR CRÉDITOS
        // ============================================
        
        const custoPorJogo = isPro ? 2 : 3;
        const custoTotal = quantity * custoPorJogo;
        
        if (user.creditos < custoTotal) {
            return res.status(402).json({ 
                error: 'Saldo insuficiente', 
                credits: user.creditos,
                needed: custoTotal 
            });
        }
        
        // ============================================
        // CARREGAR CSV
        // ============================================
        
        let dadosHistoricos: number[][] = [];
        let datas: string[] = [];
        
        try {
            const host = req.headers.host;
            const protocol = host?.includes('localhost') ? 'http' : 'https';
            const csvUrl = `${protocol}://${host}/csv/${lottery}.csv`;
            
            console.log(`📥 Buscando CSV: ${csvUrl}`);
            
            const response = await fetch(csvUrl);
            if (response.ok) {
                const csvText = await response.text();
                const resultado = processarCSV(csvText, config);
                dadosHistoricos = resultado.dados;
                datas = resultado.datas;
                console.log(`📊 ${config.nome}: ${dadosHistoricos.length} concursos carregados`);
            } else {
                console.log(`⚠️ CSV não encontrado: ${response.status}`);
            }
        } catch (e) {
            console.log('⚠️ Erro ao carregar CSV:', e);
        }
        
        // ============================================
        // APLICAR FILTRO DE PERÍODO
        // ============================================
        
        if (dadosHistoricos.length > 0 && datas.length > 0 && period !== 'all') {
            dadosHistoricos = filtrarPorPeriodo(dadosHistoricos, datas, period);
            console.log(`📊 Período ${period} ano(s): ${dadosHistoricos.length} concursos`);
        }
        
        // ============================================
        // CRIAR MOTOR DE IA (USANDO CACHE)
        // ============================================
        
        const engineConfig: EngineConfig = {
            ...config,
            numerosPadrao: numerosPorJogo
        };
        
        // Usar cache para otimizar
        const context = cacheManager.getContext(lottery, dadosHistoricos);
        
        const motor = EngineFactory.criarEngine(engine, dadosHistoricos, engineConfig, isPro);
        
        // Verificar se o motor está disponível
        if (!motor.isDisponivel()) {
            return res.status(403).json({ 
                error: 'Este motor não está disponível para o seu plano. ⭐' 
            });
        }
        
        // ============================================
        // GERAR JOGOS
        // ============================================
        
        const resultado = motor.gerarJogos(quantity, 0, { dispersao });
        
        console.log(`✅ ${resultado.games.length} jogos gerados com ${resultado.engineName}`);
        
        // ============================================
        // ATUALIZAR CRÉDITOS
        // ============================================
        
        let novoSaldo = user.creditos - custoTotal;
        await supabase
            .from('usuarios')
            .update({ creditos: novoSaldo })
            .eq('uid', uid);
        
        console.log(`💰 Créditos: ${user.creditos} → ${novoSaldo}`);
        
        // ============================================
        // SALVAR HISTÓRICO
        // ============================================
        
        for (const jogo of resultado.games) {
            await supabase
                .from('historico_palpites')
                .insert({
                    usuario_uid: uid,
                    loteria: lottery,
                    jogos: jogo.numeros,
                    modo: engine,
                    quantidade_numeros: numerosPorJogo,
                    custo: custoPorJogo,
                    filtros: `Período: ${period}, Dispersão: ${dispersao}`,
                    extras: {
                        timeCoracao: jogo.timeCoracao || null,
                        trevos: jogo.trevos || null,
                        mesSorte: jogo.mesSorte || null,
                        colunas: jogo.colunas || null,
                        lotecaResultados: jogo.lotecaResultados || null,
                        explicacao: jogo.explicacao || null
                    },
                    created_at: new Date().toISOString()
                });
        }
        
        console.log(`💾 ${resultado.games.length} jogos salvos no histórico`);
        
        // ============================================
        // LIMPAR CACHE PERIODICAMENTE
        // ============================================
        
        cacheManager.cleanup();
        
        // ============================================
        // RESPOSTA
        // ============================================
        
        return res.status(200).json({
            success: true,
            games: resultado.games,
            creditsSpent: custoTotal,
            creditsRemaining: novoSaldo,
            engine: engine,
            engineName: resultado.engineName,
            confidence: resultado.confidence,
            explanation: resultado.explanation,
            iaUsed: dadosHistoricos.length >= 10,
            totalHistorico: dadosHistoricos.length,
            isPro: isPro
        });
        
    } catch (error: any) {
        console.error('❌ Erro no handler:', error);
        return res.status(500).json({ 
            error: error.message || 'Erro interno do servidor',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
