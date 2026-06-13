// api/train/index.ts
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

// Função para processar CSV e extrair números
function processarCSV(texto: string, config: any): { dados: number[][]; datas: string[] } {
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    const dados: number[][] = [];
    const datas: string[] = [];
    const sep = linhas[0]?.includes(';') ? ';' : ',';

    function isDataValida(str: string): boolean {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(str) || /^\d{4}-\d{2}-\d{2}$/.test(str);
    }

    function parseData(str: string): string | null {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [a, m, d] = str.split('-');
            return `${d}/${m}/${a}`;
        }
        return null;
    }

    for (const linha of linhas) {
        if (!linha.trim()) continue;
        
        let colunas = linha.split(sep);
        while (colunas.length > 0 && colunas[colunas.length - 1].trim() === '') {
            colunas.pop();
        }
        
        if (colunas.length < 2) continue;
        
        let data: string | null = null;
        let dataIndex = -1;
        for (let j = 0; j < colunas.length; j++) {
            const valor = colunas[j].trim();
            if (isDataValida(valor)) {
                data = parseData(valor);
                dataIndex = j;
                break;
            }
        }
        
        if (!data) continue;
        datas.push(data);
        
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
    
    return { dados, datas };
}

// Função para filtrar dados por período (anos)
function filtrarPorPeriodo(dados: number[][], datas: string[], anos: number | string): number[][] {
    if (anos === 'all' || dados.length === 0) return dados;
    
    const anosNum = typeof anos === 'number' ? anos : parseInt(anos as string);
    if (isNaN(anosNum)) return dados;
    
    // Encontrar última data
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
    
    if (!ultimaData) return dados;
    
    const dataCorte = new Date(ultimaData.getFullYear() - anosNum, ultimaData.getMonth(), ultimaData.getDate());
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { lottery, period = 'all', mode = 'ia_especialista', uid } = req.body;
    
    if (!lottery) {
        return res.status(400).json({ error: 'Loteria é obrigatória' });
    }
    
    const config = LOTTERY_CONFIGS[lottery];
    if (!config) {
        return res.status(400).json({ error: 'Loteria inválida' });
    }
    
    try {
        // Buscar CSV (via fetch do servidor)
        const csvUrl = `${process.env.VERCEL_URL || 'https://loterias-ia.vercel.app'}/csv/${lottery}.csv`;
        let csvText = '';
        
        try {
            const response = await fetch(csvUrl);
            if (response.ok) {
                csvText = await response.text();
            }
        } catch (e) {
            console.log(`CSV não encontrado para ${lottery}, usando dados mock`);
        }
        
        let dadosFiltrados: number[][] = [];
        let datas: string[] = [];
        let confianca = 0;
        let totalDados = 0;
        
        if (csvText) {
            const { dados, datas: datasCSV } = processarCSV(csvText, config);
            datas = datasCSV;
            dadosFiltrados = filtrarPorPeriodo(dados, datas, period);
            totalDados = dadosFiltrados.length;
            
            // Treinar IA
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
