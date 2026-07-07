// ============================================
// CAMINHO: api/generate/services/GameExtras.ts
// ============================================
// Geração de elementos extras (Times, Trevos, Meses, etc.)
// ============================================

import { RandomGenerator } from './RandomGenerator';

export class GameExtras {
    private random: RandomGenerator;
    
    // Times para Timemania
    private times: string[] = [
        'Flamengo/RJ', 'Corinthians/SP', 'Palmeiras/SP', 'São Paulo/SP',
        'Santos/SP', 'Vasco/RJ', 'Fluminense/RJ', 'Botafogo/RJ',
        'Cruzeiro/MG', 'Atlético/MG', 'Grêmio/RS', 'Internacional/RS',
        'Bahia/BA', 'Vitória/BA', 'Sport/PE', 'Náutico/PE',
        'Santa Cruz/PE', 'Fortaleza/CE', 'Ceará/CE', 'Paysandu/PA'
    ];

    // Meses para Dia de Sorte
    private meses: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    constructor(random: RandomGenerator) {
        this.random = random;
    }

    /**
     * Gera um Time do Coração (Timemania)
     * Pode ser ponderado por frequência se dados forem fornecidos
     */
    gerarTime(seed: number, dadosTimes?: string[]): string {
        if (dadosTimes && dadosTimes.length > 0) {
            // Usar dados históricos para ponderar
            const freq = new Map<string, number>();
            for (const time of dadosTimes) {
                freq.set(time, (freq.get(time) || 0) + 1);
            }

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
        }

        // Fallback: aleatório
        const idx = Math.floor(this.random.next(seed) * this.times.length);
        return this.times[idx];
    }

    /**
     * Gera 2 Trevos (+Milionária)
     */
    gerarTrevos(seed: number, dadosTrevos?: number[][]): number[] {
        if (dadosTrevos && dadosTrevos.length > 0) {
            // Usar dados históricos para ponderar
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

        // Fallback: aleatório
        const trevos = new Set<number>();
        while (trevos.size < 2) {
            trevos.add(Math.floor(this.random.next(seed + trevos.size) * 6) + 1);
        }
        return Array.from(trevos).sort((a, b) => a - b);
    }

    /**
     * Gera um Mês da Sorte (Dia de Sorte)
     */
    gerarMes(seed: number, dadosMeses?: number[]): number {
        if (dadosMeses && dadosMeses.length > 0) {
            // Usar dados históricos para ponderar
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
        }

        // Fallback: aleatório
        const idx = Math.floor(this.random.next(seed) * this.meses.length);
        return this.meses[idx];
    }

    /**
     * Gera um jogo da Super Sete (7 colunas)
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

    /**
     * Atualiza a lista de times
     */
    setTimes(times: string[]): void {
        this.times = times;
    }

    /**
     * Atualiza a lista de meses
     */
    setMeses(meses: number[]): void {
        this.meses = meses;
    }
}
