// public/js/estatisticas/loterias/lotomania.js

// ============================================
// LOTOMANIA  02/07/2026
// ============================================
// ============================================
// LOTOMANIA
// ============================================

import { renderizarBase, renderizarHeatmap, renderizarResumoIA } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    
    const heatmap = renderizarHeatmap(data.maisSorteados || [], '📊 Distribuição dos Números');
    
    const resumoIA = renderizarResumoIA([
        `Lotomania: ${data.filteredDraws || data.totalDraws || 0} concursos analisados`,
        `Número mais frequente: ${data.maisSorteados?.[0]?.numero || 'N/A'} (${data.maisSorteados?.[0]?.quantidade || 0} vezes)`,
        `Número menos frequente: ${data.menosSorteados?.[0]?.numero || 'N/A'} (${data.menosSorteados?.[0]?.quantidade || 0} vezes)`
    ]);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${heatmap}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
