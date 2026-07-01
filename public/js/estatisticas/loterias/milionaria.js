//public/js/estatisticas/loterias/milionaria.js

// ============================================
// +MILIONÁRIA - COM TREVOS  01/07/2026
// ============================================

// ============================================
// +MILIONÁRIA - COM TREVOS
// ============================================

import { renderizarBase, renderizarBarraHorizontal, renderizarResumoIA, renderizarExtras } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const trevos = data.trevos || {};
    
    // Frequência dos trevos
    const freqHtml = renderizarBarraHorizontal(
        trevos.frequencia || [],
        'trevo',
        'quantidade'
    );
    
    // Pares de trevos
    const paresHtml = renderizarBarraHorizontal(
        trevos.pares || [],
        'par',
        'quantidade'
    );
    
    // Resumo IA
    const resumoIA = renderizarResumoIA(trevos.resumoIA || []);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${freqHtml}
        ${paresHtml}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
