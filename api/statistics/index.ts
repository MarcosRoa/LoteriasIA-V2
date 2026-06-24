// api/statistics/index.ts 24/06/26
import type { VercelRequest, VercelResponse } from '@vercel/node';

const LOTTERY_CONFIGS: Record<string, { maxNumero: number; numerosPadrao: number; incluirZero: boolean }> = {
    megasena: { maxNumero: 60, numerosPadrao: 6, incluirZero: false },
    quina: { maxNumero: 80, numerosPadrao: 5, incluirZero: false },
    lotofacil: { maxNumero: 25, numerosPadrao: 15, incluirZero: false },
    lotomania: { maxNumero: 99, numerosPadrao: 50, incluirZero: true },
    duplasena: { maxNumero: 50, numerosPadrao: 6, incluirZero: false },
    timemania: { maxNumero: 80, numerosPadrao: 10, incluirZero: false },
    milionaria: { maxNumero: 50, numerosPadrao: 6, incluirZero: false },
    loteca: { maxNumero: 3, numerosPadrao: 14, incluirZero: true },
    diadesorte: { maxNumero: 31, numerosPadrao: 7, incluirZero: false },
    supersete: { maxNumero: 9, numerosPadrao: 7, incluirZero: true }
};

// ============================================
// PROCESSAR CSV
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
            
            if (config.nome === 'Timemania' && isNaN(parseInt(valor))) continue;
            
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

// ============================================
// FILTRO POR PERÍODO (CORRIGIDO)
// ============================================
function getDataCortePorAnos(datas: string[], anos: number): Date | null {
    // Pegar a ÚLTIMA data do array (mais recente)
    let ultimaData: Date | null = null;
    let ultimaDataStr: string | null = null;
    
    for (let i = datas.length - 1; i >= 0; i--) {
        const dataStr = datas[i];
        if (dataStr) {
            const partes = dataStr.split('/');
            if (partes.length === 3) {
                const data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (!isNaN(data.getTime())) {
                    ultimaData = data;
                    ultimaDataStr = dataStr;
                    break;
                }
            }
        }
    }
    
    if (!ultimaData) return null;
    
    // Subtrair os anos
    const dataCorte = new Date(ultimaData);
    dataCorte.setFullYear(dataCorte.getFullYear() - anos);
    
    // Ajustar para o início do dia
    dataCorte.setHours(0, 0, 0, 0);
    
    console.log(`📅 Última data: ${ultimaDataStr}, Corte: ${dataCorte.toLocaleDateString('pt-BR')}`);
    
    return dataCorte;
}

function filtrarPorPeriodo(dados: number[][], datas: string[], period: string | number): number[][] {
    if (period === 'all' || dados.length === 0 || datas.length === 0) return dados;
    
    const anos = typeof period === 'number' ? period : parseInt(period as string);
    if (isNaN(anos) || anos <= 0) return dados;
    
    const dataCorte = getDataCortePorAnos(datas, anos);
    if (!dataCorte) return dados;
    
    const dadosFiltrados: number[][] = [];
    
    for (let i = 0; i < dados.length; i++) {
        const dataStr = datas[i];
        if (dataStr) {
            const partes = dataStr.split('/');
            if (partes.length === 3) {
                const dataConcurso = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                // Comparar apenas a data (sem horas)
                dataConcurso.setHours(0, 0, 0, 0);
                
                if (dataConcurso >= dataCorte) {
                    dadosFiltrados.push(dados[i]);
                }
            } else {
                // Se não conseguir parsear a data, inclui o dado
                dadosFiltrados.push(dados[i]);
            }
        } else {
            // Se não tiver data, inclui o dado
            dadosFiltrados.push(dados[i]);
        }
    }
    
    console.log(`📊 Filtro ${anos} ano(s): ${dadosFiltrados.length} de ${dados.length} concursos`);
    
    return dadosFiltrados;
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
    const duplas = new Map();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                const num1 = Math.min(jogo[i], jogo[j]);
                const num2 = Math.max(jogo[i], jogo[j]);
                const key = `${num1},${num2}`;
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
    const triplas = new Map();
    
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
// MAIN HANDLER
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
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
                success: true,
                totalDraws: 0,
                filteredDraws: 0,
                period,
                lottery,
                error: 'CSV não encontrado'
            });
        }
        
        const csvText = await response.text();
        const { dados, datas } = processarCSV(csvText, config);
        const totalDraws = dados.length;
        
        console.log(`📊 Total de concursos: ${totalDraws}`);
        
        // Filtrar por período
        const dadosFiltrados = filtrarPorPeriodo(dados, datas, period);
        const filteredDraws = dadosFiltrados.length;
        
        console.log(`📊 Concursos filtrados: ${filteredDraws}`);
        
        if (filteredDraws === 0) {
            return res.status(200).json({
                success: true,
                totalDraws,
                filteredDraws: 0,
                period,
                lottery,
                message: 'Nenhum dado para o período selecionado'
            });
        }
        
        // ✅ CALCULAR ESTATÍSTICAS
        const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
        const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
        const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
        
        console.log(`📊 Frequência: ${frequencia.length} números, Duplas: ${duplas.length}, Triplas: ${triplas.length}`);
        
        return res.status(200).json({
            success: true,
            totalDraws,
            filteredDraws,
            period,
            lottery,
            frequencia: frequencia.slice(0, 20),   // Top 20
            duplas: duplas.slice(0, 20),           // Top 20
            triplas: triplas.slice(0, 20)          // Top 20
        });
        
    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
