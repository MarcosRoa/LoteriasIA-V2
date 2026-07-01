//public/js/estatisticas/loterias/quina.js

// ============================================
// QUINA  01/07/2026
// ============================================

import { renderizarBase } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    return `${base.proBanner}${base.resumo}${base.cards}${base.footer}`;
}

export default { renderizar };
