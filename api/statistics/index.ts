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
        // CORRIGIDO: caminho para public/csv/
        const csvUrl = `https://loterias-ia.vercel.app/csv/${lottery}.csv`;
        //const csvUrl = `https://loterias-ia.vercel.app/public/csv/${lottery}.csv`;
        
        console.log('📥 Buscando CSV:', csvUrl);
        
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            console.log('❌ CSV não encontrado:', response.status);
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
        
        const dadosFiltrados = filtrarPorPeriodo(dados, datas, period);
        const filteredDraws = dadosFiltrados.length;
        
        console.log('✅ Estatísticas:', { lottery, totalDraws, filteredDraws, period });
        
        return res.status(200).json({
            success: true,
            totalDraws,
            filteredDraws,
            period,
            lottery
        });
        
    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ error: error.message });
    }
}
