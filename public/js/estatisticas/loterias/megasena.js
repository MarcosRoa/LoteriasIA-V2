//public/js/estatisticas/loterias/megasena.js
// ============================================
// MEGA-SENA 01/07/2026
// ============================================

import { renderizarBase } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    return `${base.proBanner}${base.resumo}${base.cards}${base.footer}`;
}

export default { renderizar };
