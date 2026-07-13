// ============================================
// CAMINHO: api/statistics/StatisticsEngine.ts
// ============================================
// MOTOR PRINCIPAL DE ESTATÍSTICAS
// ============================================

import fs from 'fs';
import path from 'path';
import { FrequencyAnalyzer } from './FrequencyAnalyzer.js';
import { DelayAnalyzer } from './DelayAnalyzer.js';
import { PairsAnalyzer } from './PairsAnalyzer.js';
import { TriplesAnalyzer } from './TriplesAnalyzer.js';
import { HeatmapAnalyzer } from './HeatmapAnalyzer.js';
import { ExtrasAnalyzer } from './ExtrasAnalyzer.js';
import { TrendAnalyzer } from './TrendAnalyzer.js';
import { EntropyAnalyzer } from './EntropyAnalyzer.js';

interface CsvData {
    dados: number[][];
    datas: string[];
    config: {
        maxNumero: number;
        incluirZero: boolean;
        numerosPadrao: number;
    };
}

interface StatisticsResult {
    success: boolean;
    totalDraws?: number;
    filteredDraws?: number;
    dataInicio?: string;
    dataFim?: string;
    maisSorteados?: { numero: number; quantidade: number }[];
    menosSorteados?: { numero: number; quantidade: number }[];
    duplas?: { dupla: number[]; quantidade: number }[];
    triplas?: { tripla: number[]; quantidade: number }[];
    atraso?: { numero: number; atraso: number }[];
    elementosExtras?: any;
    columns?: number[][];
    error?: string;
}

export class StatisticsEngine {
    private csvPath: string;

    constructor() {
        this.csvPath = path.join(process.cwd(), 'public', 'csv');
    }

    async calculate(lottery: string, period: string): Promise<StatisticsResult> {
        try {
            const csvData = await this.loadCSV(lottery);
            if (!csvData) {
                return {
                    success: false,
                    error: `Arquivo CSV para ${lottery} não encontrado`
                };
            }

            const { dados, datas, config } = csvData;

            if (dados.length === 0) {
                return {
                    success: false,
                    error: `Nenhum dado encontrado para ${lottery}`
                };
            }

            const { dadosFiltrados, datasFiltradas } = this.filterByPeriod(dados, datas, period);

            if (dadosFiltrados.length === 0) {
                return {
                    success: false,
                    error: `Nenhum dado no período selecionado para ${lottery}`
                };
            }

            const maxNumero = config.maxNumero;
            const incluirZero = config.incluirZero || false;

            // Frequência
            const frequencyAnalyzer = new FrequencyAnalyzer();
            const maisSorteados = frequencyAnalyzer.getMostFrequent(dadosFiltrados, maxNumero, incluirZero, 20);
            const menosSorteados = frequencyAnalyzer.getLeastFrequent(dadosFiltrados, maxNumero, incluirZero, 20);

            // Duplas
            const pairsAnalyzer = new PairsAnalyzer();
            const duplas = pairsAnalyzer.getMostFrequent(dadosFiltrados, 20);

            // Triplas
            const triplesAnalyzer = new TriplesAnalyzer();
            const triplas = triplesAnalyzer.getMostFrequent(dadosFiltrados, 20);

            // Atraso
            const delayAnalyzer = new DelayAnalyzer();
            const atraso = delayAnalyzer.calculate(dadosFiltrados, maxNumero, incluirZero);

            // Heatmap (Super Sete)
            let columns: number[][] | undefined = undefined;
            if (lottery === 'supersete') {
                const heatmapAnalyzer = new HeatmapAnalyzer();
                columns = heatmapAnalyzer.calculate(dadosFiltrados, 7, 9);
            }

            // Elementos extras
            const extrasAnalyzer = new ExtrasAnalyzer();
            const elementosExtras = extrasAnalyzer.calculate(lottery, dadosFiltrados, datasFiltradas);

            const dataInicio = datasFiltradas[0] || 'N/A';
            const dataFim = datasFiltradas[datasFiltradas.length - 1] || 'N/A';

            const result: StatisticsResult = {
                success: true,
                totalDraws: dados.length,
                filteredDraws: dadosFiltrados.length,
                dataInicio,
                dataFim,
                maisSorteados,
                menosSorteados,
                duplas,
                triplas,
                atraso
            };

            if (elementosExtras && Object.keys(elementosExtras).length > 0) {
                result.elementosExtras = elementosExtras;
            }

            if (columns) {
                result.columns = columns;
            }

            return result;

        } catch (error) {
            console.error('❌ Erro no StatisticsEngine:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro ao calcular estatísticas'
            };
        }
    }

    private async loadCSV(lottery: string): Promise<CsvData | null> {
        try {
            const filePath = path.join(this.csvPath, `${lottery}.csv`);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            return this.parseCSV(fileContent, lottery);
        } catch (error) {
            console.error(`❌ Erro ao carregar CSV ${lottery}:`, error);
            return null;
        }
    }

    private parseCSV(texto: string, lottery: string): CsvData | null {
        const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
        const dados: number[][] = [];
        const datas: string[] = [];

        const configs: Record<string, { maxNumero: number; incluirZero: boolean; numerosPadrao: number }> = {
            megasena: { maxNumero: 60, incluirZero: false, numerosPadrao: 6 },
            quina: { maxNumero: 80, incluirZero: false, numerosPadrao: 5 },
            lotofacil: { maxNumero: 25, incluirZero: false, numerosPadrao: 15 },
            lotomania: { maxNumero: 99, incluirZero: true, numerosPadrao: 20 },
            duplasena: { maxNumero: 50, incluirZero: false, numerosPadrao: 6 },
            timemania: { maxNumero: 80, incluirZero: false, numerosPadrao: 7 },
            milionaria: { maxNumero: 50, incluirZero: false, numerosPadrao: 6 },
            diadesorte: { maxNumero: 31, incluirZero: false, numerosPadrao: 7 },
            supersete: { maxNumero: 9, incluirZero: true, numerosPadrao: 7 },
            loteca: { maxNumero: 3, incluirZero: true, numerosPadrao: 14 }
        };

        const config = configs[lottery];
        if (!config) return null;

        const sep = linhas[0]?.includes(';') ? ';' : ',';

        const isDataValida = (str: string): boolean => {
            return /^\d{2}\/\d{2}\/\d{4}$/.test(str) || /^\d{4}-\d{2}-\d{2}$/.test(str);
        };

        const parseData = (str: string): string | null => {
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                const [a, m, d] = str.split('-');
                return `${d}/${m}/${a}`;
            }
            return null;
        };

        const minimo = config.incluirZero ? 0 : 1;

        for (const linha of linhas) {
            if (!linha.trim()) continue;

            let colunas = linha.split(sep);
            while (colunas.length > 0 && (colunas[colunas.length - 1].trim() === '' || colunas[colunas.length - 1].trim().includes(';'))) {
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

            const numeros: number[] = [];
            for (let j = dataIndex + 1; j < colunas.length; j++) {
                let valor = colunas[j]?.trim();
                if (valor === '' || valor === undefined) continue;

                let num = parseInt(valor);
                if (isNaN(num)) {
                    const numStr = valor.toString().trim();
                    if (/^\d+$/.test(numStr)) {
                        num = parseInt(numStr);
                    } else {
                        continue;
                    }
                }

                if (num >= minimo && num <= config.maxNumero) {
                    numeros.push(num);
                }
            }

            if (numeros.length >= config.numerosPadrao) {
                const numerosOrdenados = numeros.slice(0, config.numerosPadrao).sort((a, b) => a - b);
                dados.push(numerosOrdenados);
                datas.push(data);
            }
        }

        return { dados, datas, config };
    }

    private filterByPeriod(dados: number[][], datas: string[], period: string): { dadosFiltrados: number[][]; datasFiltradas: string[] } {
        if (period === 'all' || dados.length === 0) {
            return { dadosFiltrados: dados, datasFiltradas: datas };
        }

        const anos = parseInt(period);
        if (isNaN(anos)) {
            return { dadosFiltrados: dados, datasFiltradas: datas };
        }

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

        if (!ultimaData) {
            return { dadosFiltrados: dados, datasFiltradas: datas };
        }

        const dataCorte = new Date(ultimaData.getFullYear() - anos, ultimaData.getMonth(), ultimaData.getDate());
        const dadosFiltrados: number[][] = [];
        const datasFiltradas: string[] = [];

        for (let i = 0; i < dados.length; i++) {
            const dataStr = datas[i];
            if (dataStr) {
                const partes = dataStr.split('/');
                if (partes.length === 3) {
                    const data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                    if (data >= dataCorte) {
                        dadosFiltrados.push(dados[i]);
                        datasFiltradas.push(datas[i]);
                    }
                }
            }
        }

        return { dadosFiltrados, datasFiltradas };
    }
}
