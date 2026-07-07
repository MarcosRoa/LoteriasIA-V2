// ============================================
// CAMINHO: api/generate/analysis/ProbabilityAnalyzer.ts
// ============================================
// Análise probabilística: binomial, entropia, variância, etc.
// ============================================

export class ProbabilityAnalyzer {
    private dados: number[][];
    private distribuicao: Map<number, number> = new Map();

    constructor(dados: number[][]) {
        this.dados = dados;
        this.calcularDistribuicao();
    }

    /**
     * Calcula a distribuição de probabilidade de cada número
     */
    private calcularDistribuicao(): void {
        const freq = new Map<number, number>();
        const total = this.dados.length * (this.dados[0]?.length || 1);

        for (const jogo of this.dados) {
            for (const num of jogo) {
                freq.set(num, (freq.get(num) || 0) + 1);
            }
        }

        for (const [num, count] of freq) {
            this.distribuicao.set(num, count / total);
        }
    }

    /**
     * Probabilidade de um número específico
     */
    getProbabilidade(numero: number): number {
        return this.distribuicao.get(numero) || 0;
    }

    /**
     * Distribuição Binomial: P(X = k)
     * Probabilidade de um número aparecer exatamente k vezes em n tentativas
     */
    getBinomial(numero: number, k: number, n: number): number {
        const p = this.getProbabilidade(numero);
        if (p === 0) return 0;

        // C(n,k) * p^k * (1-p)^(n-k)
        const combinacao = this.fatorial(n) / (this.fatorial(k) * this.fatorial(n - k));
        return combinacao * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    /**
     * Distribuição Hipergeométrica
     * Probabilidade de selecionar k sucessos em n tentativas sem reposição
     */
    getHipergeometrica(numero: number, k: number, n: number, N: number): number {
        const K = this.getFrequencia(numero);
        if (K === 0) return 0;

        // C(K,k) * C(N-K, n-k) / C(N, n)
        const c1 = this.combinacao(K, k);
        const c2 = this.combinacao(N - K, n - k);
        const c3 = this.combinacao(N, n);

        return (c1 * c2) / c3;
    }

    /**
     * Entropia de Shannon da distribuição
     * Mede o "caos" da distribuição
     */
    getEntropia(): number {
        let entropia = 0;
        for (const [_, prob] of this.distribuicao) {
            if (prob > 0) {
                entropia += prob * Math.log2(prob);
            }
        }
        return -entropia;
    }

    /**
     * Variância da distribuição
     */
    getVariancia(): number {
        const valores = Array.from(this.distribuicao.values());
        const media = valores.reduce((a, b) => a + b, 0) / valores.length;
        return valores.reduce((a, b) => a + Math.pow(b - media, 2), 0) / valores.length;
    }

    /**
     * Probabilidade condicional: P(A|B)
     * Probabilidade de A ocorrer dado que B ocorreu
     */
    getProbabilidadeCondicional(A: number, B: number): number {
        const freqA = this.getFrequencia(A);
        const freqB = this.getFrequencia(B);
        const freqAB = this.getFrequenciaConjunta(A, B);

        return freqB > 0 ? freqAB / freqB : 0;
    }

    /**
     * Retorna a frequência de um número
     */
    private getFrequencia(numero: number): number {
        let count = 0;
        for (const jogo of this.dados) {
            if (jogo.includes(numero)) count++;
        }
        return count;
    }

    /**
     * Retorna a frequência conjunta de dois números
     */
    private getFrequenciaConjunta(A: number, B: number): number {
        let count = 0;
        for (const jogo of this.dados) {
            if (jogo.includes(A) && jogo.includes(B)) count++;
        }
        return count;
    }

    /**
     * Fatorial
     */
    private fatorial(n: number): number {
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * Combinação: C(n,k)
     */
    private combinacao(n: number, k: number): number {
        if (k < 0 || k > n) return 0;
        return this.fatorial(n) / (this.fatorial(k) * this.fatorial(n - k));
    }

    /**
     * Gera números baseados na distribuição de probabilidade
     */
    gerarPorProbabilidade(quantidade: number, seed: number): number[] {
        const numeros = new Set<number>();
        const sorted = Array.from(this.distribuicao.entries())
            .sort((a, b) => b[1] - a[1]);

        // Função aleatória com seed
        const random = (s: number) => {
            const x = Math.sin(s + 1) * 10000;
            return x - Math.floor(x);
        };

        while (numeros.size < quantidade) {
            const rand = random(seed + numeros.size);
            let acumulado = 0;
            for (const [num, prob] of sorted) {
                acumulado += prob;
                if (rand <= acumulado) {
                    numeros.add(num);
                    break;
                }
            }
        }

        return Array.from(numeros).sort((a, b) => a - b);
    }
}
