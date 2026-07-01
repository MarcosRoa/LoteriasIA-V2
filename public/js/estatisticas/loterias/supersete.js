// public/js/estatisticas/loterias/supersete.js

// ============================================
// SUPER SETE - 7 COLUNAS   01/07/2026
// ============================================

// ============================================
// SUPER SETE - 7 COLUNAS
// ============================================

import { renderizarBase, renderizarHeatmap, renderizarRanking } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const columns = data.columns || [];
    
    // Calcular ranking por coluna
    const colunasRanking = columns.map((col, idx) => ({
        nome: `Coluna ${idx + 1}`,
        total: col.length,
        cor: ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'][idx % 7]
    }));
    
    const heatmapHtml = renderizarHeatmap(columns);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${heatmapHtml}
        ${base.cards}
        ${base.footer}
    `;
}

export default { renderizar };
