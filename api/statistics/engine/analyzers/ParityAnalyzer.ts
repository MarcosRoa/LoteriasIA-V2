// ============================================
// CAMINHO: api/statistics/engine/analyzers/ParityAnalyzer.ts
// ============================================
// ANÁLISE DE PARIDADE (PARES × ÍMPARES)
// ============================================

export class ParityAnalyzer {
    calculate(dados: number[][]): { pares: number; impares: number; quantidade: number }[] {
        const proporcoes = new Map<string, number>();

        dados.forEach(jogo => {
            let pares = 0;
            let impares = 0;
            jogo.forEach(num => {
                if (num % 2 === 0) {
                    pares++;
                } else {
                    impares++;
                }
            });
            const key = `${pares}x${impares}`;
            proporcoes.set(key, (proporcoes.get(key) || 0) + 1);
        });

        return Array.from(proporcoes.entries())
            .map(([key, quantidade]) => {
                const [pares, impares] = key.split('x').map(Number);
                return { pares, impares, quantidade };
            })
            .sort((a, b) => b.quantidade - a.quantidade);
    }
}
