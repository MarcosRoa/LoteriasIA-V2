// api/statistics/index.ts 24/06/26
// api/statistics/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================
const LOTTERY_CONFIGS: Record<string, { 
    maxNumero: number; 
    numerosPadrao: number; 
    incluirZero: boolean;
    nome: string;
}> = {
    megasena: { 
        maxNumero: 60, 
        numerosPadrao: 6, 
        incluirZero: false,
        nome: 'Mega-Sena' 
    },
    quina: { 
        maxNumero: 80, 
        numerosPadrao: 5, 
        incluirZero: false,
        nome: 'Quina' 
    },
    lotofacil: { 
        maxNumero: 25, 
        numerosPadrao: 15, 
        incluirZero: false,
        nome: 'Lotofácil' 
    },
    lotomania: { 
        maxNumero: 99, 
        numerosPadrao: 20, 
        incluirZero: true,
        nome: 'Lotomania' 
    },
    duplasena: { 
        maxNumero: 50, 
        numerosPadrao: 6, 
        incluirZero: false,
        nome: 'Dupla Sena' 
    },
    timemania: { 
        maxNumero: 80, 
        numerosPadrao: 7, 
        incluirZero: false,
        nome: 'Timemania' 
    },
    milionaria: { 
        maxNumero: 50, 
        numerosPadrao: 6, 
        incluirZero: false,
        nome: '+Milionária' 
    },
    loteca: { 
        maxNumero: 3, 
        numerosPadrao: 14, 
        incluirZero: true,
        nome: 'Loteca' 
    },
    diadesorte: { 
        maxNumero: 31, 
        numerosPadrao: 7, 
        incluirZero: false,
        nome: 'Dia de Sorte' 
    },
    supersete: { 
        maxNumero: 9, 
        numerosPadrao: 7, 
        incluirZero: true,
        nome: 'Super Sete' 
    }
};

// ============================================
// PROCESSAR CSV
// ============================================
function processarCSV(texto: string, config: any): { dados: number[][]; datas: string[] } {
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    const dados: number[][] = [];
    const datas: string[] = [];
    
    if (linhas.length === 0) {
        console.log(`⚠️ Nenhuma linha encontrada no CSV para ${config.nome}`);
        return { dados, datas };
    }
    
    const sep = linhas[0]?.includes(';') ? ';' : ',';
    console.log(`📊 Processando ${config.nome} com separador: "${sep}"`);
    
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
        const isTimemania = config.nome === 'Timemania';
        
        for (let j = dataIndex + 1; j < colunas.length; j++) {
            let valor = colunas[j]?.trim();
            if (valor === '' || valor === undefined) continue;
            
            if (isTimemania && isNaN(parseInt(valor))) {
                continue;
            }
            
            let num = parseInt(valor);
            if (isNaN(num)) {
                const match = valor.match(/\d+/);
                if (match) {
                    num = parseInt(match[0]);
                } else {
                    continue;
                }
            }
            
            const min = config.incluirZero ? 0 : 1;
            if (num >= min && num <= config.maxNumero) {
                numeros.push(num);
            }
        }
        
        if (numeros.length >= config.numerosPadrao) {
            const numerosSorteados = numeros.slice(0, config.numerosPadrao);
            const numerosOrdenados = [...numerosSorteados].sort((a, b) => a - b);
            dados.push(numerosOrdenados);
        }
    }
    
    console.log(`✅ Processado ${dados.length} concursos para ${config.nome}`);
    return { dados, datas };
}

// ============================================
// CORREÇÃO 3: MELHORAR SELEÇÃO DA ÚLTIMA DATA
// ============================================
function obterUltimaData(datas: string[]): Date | null {
    const datasValidas = datas
        .map(dataStr => {
            const partes = dataStr.split('/');
            if (partes.length !== 3) return null;
            const [d, m, a] = partes.map(Number);
            return new Date(a, m - 1, d);
        })
        .filter(d => d !== null && !isNaN(d.getTime())) as Date[];
    
    if (datasValidas.length === 0) return null;
    
    return new Date(Math.max(...datasValidas.map(d => d.getTime())));
}

// ============================================
// CORREÇÃO 2: ADICIONAR DATAS DO PERÍODO
// ============================================
function filtrarPorPeriodoComDatas(
    dados: number[][], 
    datas: string[], 
    period: string | number
): { dadosFiltrados: number[][]; datasFiltradas: string[]; dataInicio: string; dataFim: string } {
    // Se for "all", retorna todos os dados
    if (period === 'all' || dados.length === 0 || datas.length === 0) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const anos = typeof period === 'number' ? period : parseInt(period as string);
    if (isNaN(anos) || anos <= 0) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    // CORREÇÃO 3: Usa a função melhorada para obter a última data
    const ultimaData = obterUltimaData(datas);
    if (!ultimaData) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const dataCorte = new Date(
        ultimaData.getFullYear() - anos,
        ultimaData.getMonth(),
        ultimaData.getDate()
    );
    dataCorte.setHours(0, 0, 0, 0);
    
    const dadosFiltrados: number[][] = [];
    const datasFiltradas: string[] = [];
    
    for (let i = 0; i < dados.length; i++) {
        const dataStr = datas[i];
        if (!dataStr) continue;
        
        const partes = dataStr.split('/');
        if (partes.length !== 3) continue;
        
        const [d, m, a] = partes.map(Number);
        const dataConcurso = new Date(a, m - 1, d);
        dataConcurso.setHours(0, 0, 0, 0);
        
        if (dataConcurso >= dataCorte) {
            dadosFiltrados.push(dados[i]);
            datasFiltradas.push(dataStr);
        }
    }
    
    return {
        dadosFiltrados,
        datasFiltradas,
        dataInicio: datasFiltradas.length > 0 ? datasFiltradas[0] : '',
        dataFim: datasFiltradas.length > 0 ? datasFiltradas[datasFiltradas.length - 1] : ''
    };
}

// ============================================
// CÁLCULOS ESTATÍSTICOS
// ============================================
function calcularFrequenciaNumeros(dados: number[][], maxNumero: number, incluirZero: boolean = false) {
    const limite = maxNumero + (incluirZero ? 1 : 0);
    const freq = new Array(limite).fill(0);
    
    dados.forEach(jogo => {
        jogo.forEach(numero => {
            if (numero >= 0 && numero < limite) {
                freq[numero]++;
            }
        });
    });
    
    const resultados = [];
    for (let i = incluirZero ? 0 : 1; i < limite; i++) {
        resultados.push({ numero: i, quantidade: freq[i] });
    }
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularDuplasMaisSorteadas(dados: number[][]) {
    const duplas = new Map<string, number>();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                const key = `${Math.min(jogo[i], jogo[j])},${Math.max(jogo[i], jogo[j])}`;
                duplas.set(key, (duplas.get(key) || 0) + 1);
            }
        }
    });
    
    const resultados = Array.from(duplas.entries()).map(([key, quantidade]) => {
        const [num1, num2] = key.split(',').map(Number);
        return { dupla: [num1, num2], quantidade };
    });
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularTriplasMaisSorteadas(dados: number[][]) {
    const triplas = new Map<string, number>();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                for (let k = j + 1; k < jogo.length; k++) {
                    const nums = [jogo[i], jogo[j], jogo[k]].sort((a, b) => a - b);
                    const key = `${nums[0]},${nums[1]},${nums[2]}`;
                    triplas.set(key, (triplas.get(key) || 0) + 1);
                }
            }
        }
    });
    
    const resultados = Array.from(triplas.entries()).map(([key, quantidade]) => {
        const [num1, num2, num3] = key.split(',').map(Number);
        return { tripla: [num1, num2, num3], quantidade };
    });
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { lottery, period = 'all' } = req.query;
    
    if (!lottery) {
        return res.status(400).json({ error: 'Loteria é obrigatória' });
    }
    
    const config = LOTTERY_CONFIGS[lottery as string];
    if (!config) {
        return res.status(400).json({ error: 'Loteria inválida' });
    }
    
    try {
        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const csvUrl = `${protocol}://${host}/csv/${lottery}.csv`;
        
        console.log(`📥 Buscando CSV: ${csvUrl}`);
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
            console.log(`❌ CSV não encontrado: ${response.status}`);
            return res.status(200).json({
                success: false,
                error: 'CSV não encontrado',
                totalDraws: 0,
                filteredDraws: 0,
                period,
                lottery,
                dataInicio: '',
                dataFim: '',
                maisSorteados: [],
                menosSorteados: [],
                duplas: [],
                triplas: []
            });
        }
        
        const csvText = await response.text();
        
        // Log das primeiras linhas para debug
        const primeirasLinhas = csvText.split('\n').slice(0, 3).join('\n');
        console.log(`📄 Primeiras linhas do CSV (${lottery}):`, primeirasLinhas);
        
        // Processa o CSV
        const { dados, datas } = processarCSV(csvText, config);
        const totalDraws = dados.length;
        
        if (totalDraws === 0) {
            return res.status(200).json({
                success: false,
                error: 'Nenhum dado encontrado no CSV',
                totalDraws: 0,
                filteredDraws: 0,
                period,
                lottery,
                dataInicio: '',
                dataFim: '',
                maisSorteados: [],
                menosSorteados: [],
                duplas: [],
                triplas: []
            });
        }
        
        // CORREÇÃO 2: Filtra por período com datas
        const { dadosFiltrados, datasFiltradas, dataInicio, dataFim } = 
            filtrarPorPeriodoComDatas(dados, datas, period);
        
        const filteredDraws = dadosFiltrados.length;
        
        if (filteredDraws === 0) {
            return res.status(200).json({
                success: true,
                totalDraws,
                filteredDraws: 0,
                period,
                lottery,
                dataInicio: '',
                dataFim: '',
                message: 'Nenhum dado para o período selecionado',
                maisSorteados: [],
                menosSorteados: [],
                duplas: [],
                triplas: []
            });
        }
        
        // Calcula estatísticas
        const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
        const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
        const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
        
        // CORREÇÃO 1: Retorna maisSorteados e menosSorteados separados
        const maisSorteados = frequencia.slice(0, 20);
        const menosSorteados = [...frequencia]
            .sort((a, b) => a.quantidade - b.quantidade)
            .slice(0, 20);
        
        // CORREÇÃO 4: JSON final padronizado
        return res.status(200).json({
            success: true,
            lottery: lottery as string,
            period: period as string,
            totalDraws,
            filteredDraws,
            dataInicio,
            dataFim,
            maisSorteados,
            menosSorteados,
            duplas: duplas.slice(0, 20),
            triplas: triplas.slice(0, 20)
        });
        
    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor',
            lottery: lottery as string,
            period: period as string,
            totalDraws: 0,
            filteredDraws: 0,
            dataInicio: '',
            dataFim: '',
            maisSorteados: [],
            menosSorteados: [],
            duplas: [],
            triplas: []
        });
    }
}
