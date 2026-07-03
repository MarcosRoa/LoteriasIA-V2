// ============================================
// CAMINHO: api/generate/evaluation/ConfidenceCalculator.ts
// ============================================
// Calculadora de confiança para motores
// ============================================

export interface ConfidenceFactors {
    quantidadeConcursos: number;    // 0-100
    qualidadeEstatistica: number;   // 0-100
    quantidadeFiltros: number;      // 0-100
    estabilidade: number;           // 0-100
}

export class ConfidenceCalculator {
    /**
     * Calcula a confiança baseada em múltiplos fatores
     */
    calcular(factors: ConfidenceFactors): number {
        // Pesos
        const pesos = {
            quantidadeConcursos: 0.30,
            qualidadeEstatistica: 0.30,
            quantidadeFiltros: 0.20,
            estabilidade: 0.20
        };

        const confianca = 
            factors.quantidadeConcursos * pesos.quantidadeConcursos +
            factors.qualidadeEstatistica * pesos.qualidadeEstatistica +
            factors.quantidadeFiltros * pesos.quantidadeFiltros +
            factors.estabilidade * pesos.estabilidade;

        return Math.max(0, Math.min(100, confianca));
    }

    /**
     * Calcula a confiança baseada na quantidade de dados
     */
    calcularPorQuantidade(totalConcursos: number): number {
        if (totalConcursos < 10) return 20;
        if (totalConcursos < 50) return 40;
        if (totalConcursos < 100) return 55;
        if (totalConcursos < 200) return 70;
        if (totalConcursos < 500) return 80;
        if (totalConcursos < 1000) return 88;
        return 95;
    }

    /**
     * Calcula a confiança baseada na qualidade estatística
     */
    calcularPorQualidade(analises: { nome: string; valor: number }[]): number {
        const total = analises.reduce((acc, a) => acc + a.valor, 0);
        return total / analises.length;
    }

    /**
     * Calcula a confiança baseada na quantidade de filtros
     */
    calcularPorFiltros(quantidade: number, maximo: number = 10): number {
        return Math.min(100, (quantidade / maximo) * 100);
    }

    /**
     * Calcula a estabilidade (variação dos dados)
     */
    calcularEstabilidade(dados: number[][]): number {
        if (dados.length < 10) return 50;

        // Calcular a variação da frequência dos números
        const freq = new Map<number, number>();
        for (const jogo of dados) {
            for (const num of jogo) {
                freq.set(num, (freq.get(num) || 0) + 1);
            }
        }

        const valores = Array.from(freq.values());
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        const variancia = valores.reduce((a, b) => a + Math.pow(b - media, 2), 0) / valores.length;
        const desvioPadrao = Math.sqrt(variancia);

        // Quanto menor o desvio, mais estável
        const estabilidade = 100 - Math.min(100, (desvioPadrao / media) * 100);
        return Math.max(0, estabilidade);
    }

    /**
     * Calcula todos os fatores e retorna a confiança
     */
    calcularCompleta(
        dados: number[][],
        filtrosAplicados: string[]
    ): { confianca: number; fatores: ConfidenceFactors } {
        const fatores: ConfidenceFactors = {
            quantidadeConcursos: this.calcularPorQuantidade(dados.length),
            qualidadeEstatistica: this.calcularPorQualidade([
                { nome: 'frequencia', valor: 80 },
                { nome: 'atraso', valor: 70 },
                { nome: 'dispersao', valor: 75 }
            ]),
            quantidadeFiltros: this.calcularPorFiltros(filtrosAplicados.length),
            estabilidade: this.calcularEstabilidade(dados)
        };

        return {
            confianca: this.calcular(fatores),
            fatores: fatores
        };
    }

    /**
     * Retorna uma explicação textual da confiança
     */
    explicarConfianca(confianca: number): string {
        if (confianca >= 90) return '⭐ Excelente';
        if (confianca >= 75) return '👍 Muito boa';
        if (confianca >= 60) return '📊 Boa';
        if (confianca >= 45) return '📈 Razoável';
        if (confianca >= 30) return '📉 Baixa';
        return '⚠️ Muito baixa';
    }
}
