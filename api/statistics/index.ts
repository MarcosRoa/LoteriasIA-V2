// api/statistics/index.ts 24/06/26
// api/statistics/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================
// MAPEAMENTO DE MESES (Número -> Nome)
// ============================================
const MESES_NOME: Record<number, string> = {
    1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
    5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
    9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
};

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================
const LOTTERY_CONFIGS: Record<string, { 
    maxNumero: number; 
    numerosPadrao: number; 
    incluirZero: boolean;
    nome: string;
    temElementoExtra?: boolean;
    nomeElemento?: string;
    tipoElemento?: 'time' | 'mes';
}> = {
    megasena: { maxNumero: 60, numerosPadrao: 6, incluirZero: false, nome: 'Mega-Sena' },
    quina: { maxNumero: 80, numerosPadrao: 5, incluirZero: false, nome: 'Quina' },
    lotofacil: { maxNumero: 25, numerosPadrao: 15, incluirZero: false, nome: 'Lotofácil' },
    lotomania: { maxNumero: 99, numerosPadrao: 20, incluirZero: true, nome: 'Lotomania' },
    duplasena: { maxNumero: 50, numerosPadrao: 6, incluirZero: false, nome: 'Dupla Sena' },
    timemania: { maxNumero: 80, numerosPadrao: 7, incluirZero: false, nome: 'Timemania', temElementoExtra: true, nomeElemento: 'Time do Coração', tipoElemento: 'time' },
    milionaria: { maxNumero: 50, numerosPadrao: 6, incluirZero: false, nome: '+Milionária' },
    loteca: { maxNumero: 3, numerosPadrao: 14, incluirZero: true, nome: 'Loteca' },
    diadesorte: { maxNumero: 31, numerosPadrao: 7, incluirZero: false, nome: 'Dia de Sorte', temElementoExtra: true, nomeElemento: 'Mês de Sorte', tipoElemento: 'mes' },
    supersete: { maxNumero: 9, numerosPadrao: 7, incluirZero: true, nome: 'Super Sete' }
};

// ============================================
// PROCESSAR CSV (CORRIGIDO PARA LOTECA)
// ============================================
function processarCSV(texto: string, config: any): { 
    dados: number[][]; 
    datas: string[]; 
    elementosExtras: (number | string)[] 
} {
    // 🔥 CORREÇÃO: Remove linhas vazias e espaços extras
    const linhas = texto.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
    
    const dados: number[][] = [];
    const datas: string[] = [];
    const elementosExtras: (number | string)[] = [];
    
    if (linhas.length === 0) {
        console.log(`⚠️ Nenhuma linha encontrada no CSV para ${config.nome}`);
        return { dados, datas, elementosExtras };
    }
    
    // 🔥 CORREÇÃO: Detecta o separador
    const primeiraLinha = linhas[0];
    const sep = primeiraLinha.includes(';') ? ';' : ',';
    console.log(`📊 Processando ${config.nome} com separador: "${sep}"`);
    
    // 🔥 CORREÇÃO: Detecta colunas (removendo espaços)
    const colunasHeader = primeiraLinha.split(sep).map(c => c.trim());
    console.log(`📊 Colunas detectadas (${colunasHeader.length}):`, colunasHeader);
    
    let dataIndex = -1;
    let extraColumnIndex = -1;
    
    // 🔥 CORREÇÃO: Procura coluna de data (aceita qualquer variação)
    for (let j = 0; j < colunasHeader.length; j++) {
        const colName = colunasHeader[j].toLowerCase();
        
        // Procura "data" ou "sorteio" (qualquer variação)
        if (colName.includes('data') || colName.includes('sorteio') || colName.includes('apura')) {
            dataIndex = j;
            console.log(`📅 Coluna de Data: "${colunasHeader[j]}" (índice ${j})`);
        }
        
        // Procura coluna extra (mês ou time)
        if (colName.includes('mes') || colName.includes('mês') || colName.includes('time')) {
            extraColumnIndex = j;
            console.log(`📊 Coluna Extra: "${colunasHeader[j]}" (índice ${j})`);
        }
    }
    
    // 🔥 CORREÇÃO: Se não encontrou "data", usa a primeira coluna
    if (dataIndex === -1) {
        dataIndex = 0;
        console.log(`⚠️ Coluna de Data não encontrada, usando primeira coluna: "${colunasHeader[0]}"`);
    }
    
    // 🔥 CORREÇÃO: Se não encontrou coluna extra, usa a última
    if (extraColumnIndex === -1) {
        extraColumnIndex = colunasHeader.length - 1;
        console.log(`⚠️ Coluna Extra não encontrada, usando última: "${colunasHeader[extraColumnIndex]}"`);
    }
    
    const isDiaDeSorte = config.nome === 'Dia de Sorte';
    const isTimemania = config.nome === 'Timemania';
    const isLoteca = config.nome === 'Loteca';
    
    // 🔥 CORREÇÃO: Começa da linha 1 (pula o cabeçalho)
    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha) continue;
        
        let colunas = linha.split(sep).map(c => c.trim());
        
        // 🔥 CORREÇÃO: Remove colunas vazias no final
        while (colunas.length > 0 && colunas[colunas.length - 1] === '') {
            colunas.pop();
        }
        
        if (colunas.length < 2) continue;
        
        // 🔥 CORREÇÃO: Pega a data
        const dataStr = colunas[dataIndex] || '';
        if (!dataStr) continue;
        
        let dataFormatada = dataStr;
        if (dataStr.includes('-')) {
            const [a, m, d] = dataStr.split('-');
            dataFormatada = `${d}/${m}/${a}`;
        }
        datas.push(dataFormatada);
        
        // Pega o elemento extra (se houver)
        let elementoExtra: number | string | null = null;
        if (extraColumnIndex < colunas.length) {
            const valor = colunas[extraColumnIndex] || '';
            if (isDiaDeSorte) {
                const num = parseInt(valor);
                if (!isNaN(num) && num >= 1 && num <= 12) {
                    elementoExtra = num;
                }
            } else if (isTimemania && valor && isNaN(parseInt(valor))) {
                elementoExtra = valor;
            }
        }
        
        // 🔥 LOTECA: Extrai os 14 jogos
        const numeros: number[] = [];
        if (isLoteca) {
            // 🔥 CORREÇÃO: Pega apenas as colunas que são jogos (ignora data e extras)
            for (let j = 0; j < colunas.length; j++) {
                if (j === dataIndex || j === extraColumnIndex) continue;
                
                const valor = colunas[j] || '';
                if (valor === '') continue;
                
                let num: number | null = null;
                const valorLower = valor.toLowerCase().trim();
                
                // 🔥 CORREÇÃO: Mapeia os valores do CSV
                if (valorLower.includes('coluna 1') || 
                    valorLower === '1' || 
                    valorLower === 'coluna1' ||
                    valorLower === 'casa') {
                    num = 0; // Vitória do mandante (1)
                } else if (valorLower.includes('coluna do meio') || 
                           valorLower.includes('meio') || 
                           valorLower === 'x' || 
                           valorLower === '0' ||
                           valorLower === 'empate') {
                    num = 1; // Empate (X)
                } else if (valorLower.includes('coluna 2') || 
                           valorLower === '2' || 
                           valorLower === 'coluna2' ||
                           valorLower === 'fora') {
                    num = 2; // Vitória do visitante (2)
                } else {
                    // Tenta extrair número
                    const match = valor.match(/\d+/);
                    if (match) {
                        const extracted = parseInt(match[0]);
                        if (extracted >= 0 && extracted <= 3) {
                            num = extracted;
                        }
                    }
                }
                
                if (num !== null && num >= 0 && num <= 3) {
                    numeros.push(num);
                }
            }
            
            // 🔥 CORREÇÃO: Verifica se tem 14 números
            if (numeros.length >= 14) {
                const numerosSorteados = numeros.slice(0, 14);
                const numerosOrdenados = [...numerosSorteados].sort((a, b) => a - b);
                dados.push(numerosOrdenados);
            } else {
                // 🔥 LOG: Mostra quantos números foram encontrados
                if (i < 5) {
                    console.log(`⚠️ Linha ${i}: ${numeros.length} números encontrados (esperado 14)`);
                }
            }
            continue;
        }
        
        // 🔥 OUTRAS LOTERIAS: Processamento normal
        for (let j = 0; j < colunas.length; j++) {
            if (j === dataIndex || j === extraColumnIndex) continue;
            
            const valor = colunas[j] || '';
            if (valor === '') continue;
            
            let num = parseInt(valor);
            if (isNaN(num)) {
                const match = valor.match(/\d+/);
                if (match) num = parseInt(match[0]);
                else continue;
            }
            
            const min = config.incluirZero ? 0 : 1;
            if (num >= min && num <= config.maxNumero) {
                numeros.push(num);
            }
        }
        
        // Salva elemento extra
        if (config.temElementoExtra && elementoExtra !== null) {
            elementosExtras.push(elementoExtra);
        }
        
        // Salva os números
        if (numeros.length >= config.numerosPadrao) {
            const numerosSorteados = numeros.slice(0, config.numerosPadrao);
            const numerosOrdenados = [...numerosSorteados].sort((a, b) => a - b);
            dados.push(numerosOrdenados);
        }
    }
    
    console.log(`✅ Processado ${dados.length} concursos para ${config.nome}`);
    console.log(`📊 Elementos extras capturados: ${elementosExtras.length}`);
    
    return { dados, datas, elementosExtras };
}

// ============================================
// FUNÇÃO PARA OBTER ÚLTIMA DATA
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
// FILTRO POR PERÍODO
// ============================================
function filtrarPorPeriodoComDatas(
    dados: number[][], 
    datas: string[],
    elementosExtras: (number | string)[],
    period: string | number
): { 
    dadosFiltrados: number[][]; 
    datasFiltradas: string[];
    elementosExtrasFiltrados: (number | string)[];
    dataInicio: string; 
    dataFim: string 
} {
    if (period === 'all' || dados.length === 0 || datas.length === 0) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            elementosExtrasFiltrados: elementosExtras,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const anos = typeof period === 'number' ? period : parseInt(period as string);
    if (isNaN(anos) || anos <= 0) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            elementosExtrasFiltrados: elementosExtras,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const ultimaData = obterUltimaData(datas);
    if (!ultimaData) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            elementosExtrasFiltrados: elementosExtras,
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
    const elementosExtrasFiltrados: (number | string)[] = [];
    
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
            if (elementosExtras && i < elementosExtras.length) {
                elementosExtrasFiltrados.push(elementosExtras[i]);
            }
        }
    }
    
    return {
        dadosFiltrados,
        datasFiltradas,
        elementosExtrasFiltrados,
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
            if (numero >= 0 && numero < limite) freq[numero]++;
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
// CALCULAR ELEMENTOS EXTRAS
// ============================================
function calcularElementosExtras(
    elementos: (number | string)[],
    tipo: 'time' | 'mes'
): { nome: string; quantidade: number; id?: number }[] {
    const freq = new Map<string, number>();
    const idMap = new Map<string, number>();
    
    elementos.forEach(el => {
        if (el === null || el === undefined) return;
        if (el === 0 || el === 'Desconhecido' || el === '') return;
        
        let nome: string;
        let id: number | undefined;
        
        if (tipo === 'mes' && typeof el === 'number') {
            nome = `${MESES_NOME[el]} (${el})`;
            id = el;
        } else {
            nome = String(el);
        }
        
        freq.set(nome, (freq.get(nome) || 0) + 1);
        if (id !== undefined) idMap.set(nome, id);
    });
    
    const resultados = Array.from(freq.entries()).map(([nome, quantidade]) => ({
        nome,
        quantidade,
        id: idMap.get(nome)
    }));
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados.slice(0, 20);
}

// ============================================
// CALCULAR ESTATÍSTICAS DA LOTECA
// ============================================
function calcularEstatisticasLoteca(dados: number[][]) {
    const freqGlobal = [0, 0, 0];
    const freqPorJogo: { casa: number; empate: number; fora: number }[] = [];
    
    if (dados.length > 0) {
        for (let i = 0; i < dados[0].length; i++) {
            freqPorJogo.push({ casa: 0, empate: 0, fora: 0 });
        }
    }
    
    dados.forEach(jogo => {
        jogo.forEach((resultado, index) => {
            if (resultado === 0) {
                freqGlobal[0]++;
                if (freqPorJogo[index]) freqPorJogo[index].casa++;
            } else if (resultado === 1) {
                freqGlobal[1]++;
                if (freqPorJogo[index]) freqPorJogo[index].empate++;
            } else if (resultado === 2) {
                freqGlobal[2]++;
                if (freqPorJogo[index]) freqPorJogo[index].fora++;
            }
        });
    });
    
    return {
        frequenciaGlobal: [
            { resultado: '🏠 Casa (1)', quantidade: freqGlobal[0] },
            { resultado: '🤝 Empate (X)', quantidade: freqGlobal[1] },
            { resultado: '✈️ Fora (2)', quantidade: freqGlobal[2] }
        ],
        frequenciaPorJogo: freqPorJogo.map((f, i) => ({
            jogo: i + 1,
            casa: f.casa,
            empate: f.empate,
            fora: f.fora,
            total: f.casa + f.empate + f.fora
        }))
    };
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const { lottery, period = 'all' } = req.query;
    
    if (!lottery) return res.status(400).json({ error: 'Loteria é obrigatória' });
    
    const config = LOTTERY_CONFIGS[lottery as string];
    if (!config) return res.status(400).json({ error: 'Loteria inválida' });
    
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
                triplas: [],
                elementosExtras: []
            });
        }
        
        const csvText = await response.text();
        const { dados, datas, elementosExtras } = processarCSV(csvText, config);
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
                triplas: [],
                elementosExtras: []
            });
        }
        
        const { dadosFiltrados, datasFiltradas, elementosExtrasFiltrados, dataInicio, dataFim } = 
            filtrarPorPeriodoComDatas(dados, datas, elementosExtras, period);
        
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
                triplas: [],
                elementosExtras: []
            });
        }
        
        // 🔥 LOTECA
        if (config.nome === 'Loteca') {
            const estatisticasLoteca = calcularEstatisticasLoteca(dadosFiltrados);
            const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
            const maisSorteados = frequencia.slice(0, 20);
            const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
            
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
                duplas: [],
                triplas: [],
                elementosExtras: [],
                loteca: estatisticasLoteca
            });
        }
        
        // 🔥 TIMEMANIA e DIA DE SORTE
        if (config.temElementoExtra) {
            const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
            const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
            const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
            
            const maisSorteados = frequencia.slice(0, 20);
            const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
            
            const elementosExtrasCalculados = calcularElementosExtras(
                elementosExtrasFiltrados,
                config.tipoElemento || 'time'
            );
            
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
                triplas: triplas.slice(0, 20),
                elementosExtras: elementosExtrasCalculados,
                tipoElemento: config.tipoElemento || 'time',
                nomeElemento: config.nomeElemento || 'Elemento Extra'
            });
        }
        
        // 🔥 OUTRAS LOTERIAS
        const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
        const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
        const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
        
        const maisSorteados = frequencia.slice(0, 20);
        const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
        
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
            triplas: triplas.slice(0, 20),
            elementosExtras: []
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
            triplas: [],
            elementosExtras: []
        });
    }
}
