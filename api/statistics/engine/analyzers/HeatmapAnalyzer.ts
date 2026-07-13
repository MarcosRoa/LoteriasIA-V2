// ============================================
// CAMINHO: api/statistics/engine/analyzers/HeatmapAnalyzer.ts
// ============================================
// ANÁLISE DE HEATMAP (SUPER SETE)
// ============================================

export class HeatmapAnalyzer {
    calculate(dados: number[][], categorias: number = 7, maxCategoria: number = 9): number[][] {
        const heatmap: number[][] = [];
        for (let i = 0; i < categorias; i++) {
            heatmap[i] = new Array(maxCategoria + 1).fill(0);
        }

        dados.forEach(item => {
            item.forEach((valor, idx) => {
                if (idx < categorias && valor >= 0 && valor <= maxCategoria) {
                    heatmap[idx][valor]++;
                }
            });
        });

        return heatmap;
    }
}
