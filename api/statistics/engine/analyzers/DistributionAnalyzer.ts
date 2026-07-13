// ============================================
// CAMINHO: api/statistics/engine/analyzers/DistributionAnalyzer.ts
// ============================================
// ANÁLISE DE DISTRIBUIÇÃO POR FAIXAS
// ============================================

export class DistributionAnalyzer {
    calculate(dados: number[][], maxNumero: number, incluirZero: boolean = false): { faixa: string; quantidade: number; percentual: number }[] {
        const limite = maxNumero + (incluirZero ? 1 : 0);
        const faixas: { min: number; max: number; label: string }[] = [];
        const step = Math.ceil(limite / 10);

        for (let i = incluirZero ? 0 : 1; i < limite; i += step) {
            const min = i;
            const max = Math.min(i + step - 1, limite - 1);
            faixas.push({ min, max, label: `${min}-${max}` });
        }

        const resultado = faixas.map(faixa => ({
            ...faixa,
            quantidade: 0,
            percentual: 0
        }));

        dados.forEach(jogo => {
            jogo.forEach(num => {
                faixas.forEach((faixa, idx) => {
                    if (num >= faixa.min && num <= faixa.max) {
                        resultado[idx].quantidade++;
                    }
                });
            });
        });

        const total = resultado.reduce((acc, r) => acc + r.quantidade, 0);
        return resultado.map(r => ({
            faixa: r.label,
            quantidade: r.quantidade,
            percentual: total > 0 ? (r.quantidade / total) * 100 : 0
        }));
    }
}
