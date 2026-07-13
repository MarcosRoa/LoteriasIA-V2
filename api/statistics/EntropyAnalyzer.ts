// ============================================
// CAMINHO: api/statistics/EntropyAnalyzer.ts
// ============================================
// ANÁLISE DE ENTROPIA
// ============================================

export class EntropyAnalyzer {
    calculate(dados: number[][], maxNumero: number, incluirZero: boolean = false): number {
        const limite = maxNumero + (incluirZero ? 1 : 0);
        const freq = new Array(limite).fill(0);

        dados.forEach(jogo => {
            jogo.forEach(num => {
                if (num >= 0 && num < limite) {
                    freq[num]++;
                }
            });
        });

        const total = dados.length;
        let entropia = 0;

        for (let i = 0; i < limite; i++) {
            const p = freq[i] / total;
            if (p > 0) {
                entropia += p * Math.log2(p);
            }
        }

        return Math.abs(entropia);
    }
}
