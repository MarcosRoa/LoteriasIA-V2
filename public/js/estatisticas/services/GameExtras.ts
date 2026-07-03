// ============================================
// CAMINHO: public/js/estatisticas/services/GameExtras.ts
// ============================================
// SERVIÇO DE ELEMENTOS EXTRAS - 100% CSV
// SEM DADOS EMBUTIDOS!
// ============================================

import { RandomGenerator } from './RandomGenerator';

export class GameExtras {
    private random: RandomGenerator;
    
    // ⚠️ NENHUMA LISTA FIXA DE TIMES OU MESES!
    // Tudo vem do CSV via parâmetros

    constructor(random: RandomGenerator) {
        this.random = random;
    }

    /**
     * Gera um Time do Coração (Timemania)
     * 🔥 100% baseado em dados do CSV
     * Se não houver dados, retorna null (não gera time fake)
     */
    gerarTime(seed: number, dadosTimes?: string[]): string | null {
        if (!dadosTimes || dadosTimes.length === 0) {
            console.warn('⚠️ Nenhum dado de times disponível no CSV');
            return null;  // ✅ NÃO USA DADOS FIXOS!
        }
        
        // Calcular frequência dos times (do CSV)
        const freq = new Map<string, number>();
        for (const time of dadosTimes) {
            freq.set(time, (freq.get(time) || 0) + 1);
        }

        // Sorteio ponderado pela frequência
        const sorted = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
        const total = sorted.reduce((acc, [_, count]) => acc + count, 0);

        let rand = this.random.next(seed);
        let acumulado = 0;
        for (const [time, count] of sorted) {
            acumulado += count / total;
            if (rand <= acumulado) {
                return time;
            }
        }

        return sorted[0]?.[0] || null;
    }

    /**
     * Gera 2 Trevos (+Milionária)
     * 🔥 100% baseado em dados do CSV
     */
    gerarTrevos(seed: number, dadosTrevos?: number[][]): number[] {
        if (!dadosTrevos || dadosTrevos.length === 0) {
            console.warn('⚠️ Nenhum dado de trevos disponível no CSV');
            // Fallback: aleatório 1-6 (isso é permitido porque é o range oficial)
            const trevos = new Set<number>();
            while (trevos.size < 2) {
                trevos.add(Math.floor(this.random.next(seed + trevos.size) * 6) + 1);
            }
            return Array.from(trevos).sort((a, b) => a - b);
        }

        // Calcular frequência dos trevos (do CSV)
        const freq = new Array(7).fill(0);
        for (const par of dadosTrevos) {
            for (const t of par) {
                if (t >= 1 && t <= 6) freq[t]++;
            }
        }

        const total = freq.reduce((a, b) => a + b, 0);
        const trevos = new Set<number>();

        while (trevos.size < 2) {
            let rand = this.random.next(seed + trevos.size);
            let acumulado = 0;
            for (let i = 1; i <= 6; i++) {
                acumulado += freq[i] / total;
                if (rand <= acumulado && !trevos.has(i)) {
                    trevos.add(i);
                    break;
                }
            }
        }

        return Array.from(trevos).sort((a, b) => a - b);
    }

    /**
     * Gera um Mês da Sorte (Dia de Sorte)
     * 🔥 100% baseado em dados do CSV
     */
    gerarMes(seed: number, dadosMeses?: number[]): number | null {
        if (!dadosMeses || dadosMeses.length === 0) {
            console.warn('⚠️ Nenhum dado de meses disponível no CSV');
            return null;  // ✅ NÃO USA DADOS FIXOS!
        }

        // Calcular frequência dos meses (do CSV)
        const freq = new Array(13).fill(0);
        for (const mes of dadosMeses) {
            if (mes >= 1 && mes <= 12) freq[mes]++;
        }

        const total = freq.reduce((a, b) => a + b, 0);
        let rand = this.random.next(seed);
        let acumulado = 0;
        for (let i = 1; i <= 12; i++) {
            acumulado += freq[i] / total;
            if (rand <= acumulado) {
                return i;
            }
        }

        return 1;
    }

    /**
     * Gera um jogo da Super Sete (7 colunas)
     * 🔥 Números de 0-9 (range oficial)
     */
    gerarSuperSete(seed: number): number[][] {
        const colunas: number[][] = [];
        for (let c = 0; c < 7; c++) {
            const num = Math.floor(this.random.next(seed + c) * 10);
            colunas.push([num]);
        }
        return colunas;
    }

    /**
     * Gera um jogo da Loteca (14 resultados)
     * 🔥 Resultados 1, X, 2 (range oficial)
     */
    gerarLoteca(seed: number): string[] {
        const opcoes = ['1', 'X', '2'];
        const resultados: string[] = [];
        for (let i = 0; i < 14; i++) {
            const idx = Math.floor(this.random.next(seed + i) * 3);
            resultados.push(opcoes[idx]);
        }
        return resultados;
    }
}
