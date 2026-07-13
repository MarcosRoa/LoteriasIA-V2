// ============================================
// CAMINHO: api/statistics/engine/StatisticsEngine.ts
// ============================================
// MOTOR PRINCIPAL DE ESTATÍSTICAS - ORQUESTRADOR
// ============================================

import { CsvParser } from './utils/CsvParser';
import { Normalizer } from './utils/Normalizer';
import { FrequencyAnalyzer } from './analyzers/FrequencyAnalyzer';
import { DelayAnalyzer } from './analyzers/DelayAnalyzer';
import { PairsAnalyzer } from './analyzers/PairsAnalyzer';
import { TriplesAnalyzer } from './analyzers/TriplesAnalyzer';
import { HeatmapAnalyzer } from './analyzers/HeatmapAnalyzer';
import { TrendAnalyzer } from './analyzers/TrendAnalyzer';
import { EntropyAnalyzer } from './analyzers/EntropyAnalyzer';
import { DistributionAnalyzer } from './analyzers/DistributionAnalyzer';
import { GroupAnalyzer } from './analyzers/GroupAnalyzer';
import { ParityAnalyzer } from './analyzers/ParityAnalyzer';
import { SequenceAnalyzer } from './analyzers/SequenceAnalyzer';
import type { StatisticsResult, LotteryContext } from './models/StatisticsResult';

export class StatisticsEngine {
    private csvParser: CsvParser;
    private normalizer: Normalizer;

    constructor() {
        this.csvParser = new CsvParser();
        this.normalizer = new Normalizer();
    }

    async calculate(lottery: string, period: string): Promise<StatisticsResult> {
        try {
            // 1. Carregar CSV
            const context = await this.csvParser.load(lottery);
            if (!context) {
                return {
                    success: false,
                    error: `Arquivo CSV para ${lottery} não encontrado`
                };
            }

            const { dados, datas, config } = context;

            if (dados.length === 0) {
                return {
                    success: false,
                    error: `Nenhum dado encontrado para ${lottery}`
                };
            }

            // 2. Aplicar filtro de período
            const { dadosFiltrados, datasFiltradas } = this.normalizer.filterByPeriod(dados, datas, period);

            if (dadosFiltrados.length === 0) {
                return {
                    success: false,
                    error: `Nenhum dado no período selecionado para ${lottery}`
                };
            }

            const maxNumero = config.maxNumero;
            const incluirZero = config.incluirZero || false;

            // 3. Executar todos os analisadores
            const frequencyAnalyzer = new FrequencyAnalyzer();
            const delayAnalyzer = new DelayAnalyzer();
            const pairsAnalyzer = new PairsAnalyzer();
            const triplesAnalyzer = new TriplesAnalyzer();
            const heatmapAnalyzer = new HeatmapAnalyzer();
            const trendAnalyzer = new TrendAnalyzer();
            const entropyAnalyzer = new EntropyAnalyzer();
            const distributionAnalyzer = new DistributionAnalyzer();
            const groupAnalyzer = new GroupAnalyzer();
            const parityAnalyzer = new ParityAnalyzer();
            const sequenceAnalyzer = new SequenceAnalyzer();

            const maisSorteados = frequencyAnalyzer.getMostFrequent(dadosFiltrados, maxNumero, incluirZero, 20);
            const menosSorteados = frequencyAnalyzer.getLeastFrequent(dadosFiltrados, maxNumero, incluirZero, 20);
            const atraso = delayAnalyzer.calculate(dadosFiltrados, maxNumero, incluirZero);
            const duplas = pairsAnalyzer.getMostFrequent(dadosFiltrados, 20);
            const triplas = triplesAnalyzer.getMostFrequent(dadosFiltrados, 20);
            const columns = lottery === 'supersete' ? heatmapAnalyzer.calculate(dadosFiltrados, 7, 9) : undefined;
            const tendencia = trendAnalyzer.calculate(dadosFiltrados, maxNumero, incluirZero, 30);
            const entropia = entropyAnalyzer.calculate(dadosFiltrados, maxNumero, incluirZero);
            const distribuicao = distributionAnalyzer.calculate(dadosFiltrados, maxNumero, incluirZero);
            const grupos = groupAnalyzer.calculate(dadosFiltrados, maxNumero, incluirZero);
            const paridade = parityAnalyzer.calculate(dadosFiltrados);
            const sequencias = sequenceAnalyzer.calculate(dadosFiltrados);

            const dataInicio = datasFiltradas[0] || 'N/A';
            const dataFim = datasFiltradas[datasFiltradas.length - 1] || 'N/A';

            // 4. Montar resultado
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
                atraso,
                tendencia,
                entropia,
                distribuicao,
                grupos,
                paridade,
                sequencias
            };

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
}
