// public/js/estatisticas/loterias/diadesorte.js

// ============================================
// DIA DE SORTE - COM MÊS  01/07/2026
// ============================================

// ============================================
// DIA DE SORTE - COM MÊS
// ============================================

import { renderizarBase, renderizarExtras } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const elementosExtras = data.elementosExtras || [];
    const nomeElemento = data.nomeElemento || 'Mês de Sorte';
    
    const mesesHtml = renderizarExtras(elementosExtras, nomeElemento, '📅', userData.isPro);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${mesesHtml}
        ${base.footer}
    `;
}

export default { renderizar };
