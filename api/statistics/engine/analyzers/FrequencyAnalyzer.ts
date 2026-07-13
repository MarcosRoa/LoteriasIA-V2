// ============================================
// CAMINHO: api/statistics/engine/analyzers/FrequencyAnalyzer.ts
// ============================================
// ANÁLISE DE FREQUÊNCIA DE NÚMEROS
// ============================================

export class FrequencyAnalyzer {
    getMostFrequent(dados: number[][], maxNumero: number, incluirZero: boolean = false, limit: number = 20): { numero: number; quantidade: number }[] {
        const limite = maxNumero + (incluirZero ? 1 : 0);
        const freq = new Array(limite).fill(0);

        dados.forEach(jogo => {
            jogo.forEach(numero => {
                if (numero >= 0 && numero < limite) {
                    freq[numero]++;
                }
            });
        });

        const resultados: { numero: number; quantidade: number }[] = [];
        const inicio = incluirZero ? 0 : 1;
        for (let i = inicio; i < limite; i++) {
            resultados.push({ numero: i, quantidade: freq[i] });
        }

        return resultados
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, limit);
    }

    getLeastFrequent(dados: number[][], maxNumero: number, incluirZero: boolean = false, limit: number = 20): { numero: number; quantidade: number }[] {
        const limite = maxNumero + (incluirZero ? 1 : 0);
        const freq = new Array(limite).fill(0);

        dados.forEach(jogo => {
            jogo.forEach(numero => {
                if (numero >= 0 && numero < limite) {
                    freq[numero]++;
                }
            });
        });

        const resultados: { numero: number; quantidade: number }[] = [];
        const inicio = incluirZero ? 0 : 1;
        for (let i = inicio; i < limite; i++) {
            resultados.push({ numero: i, quantidade: freq[i] });
        }

        return resultados
            .sort((a, b) => a.quantidade - b.quantidade)
            .slice(0, limit);
    }
}
