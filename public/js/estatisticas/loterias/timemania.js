//public/js/estatisticas/loterias/timemania.js

// ============================================
// TIMEMANIA - COM TIME DO CORAÇÃO  01/07/2026
// ============================================
// ============================================
// TIMEMANIA - COM TIME DO CORAÇÃO
// ============================================

import { renderizarBase, renderizarBarraHorizontal, renderizarResumoIA, renderizarExtras } from '../renderers/base.js';
import { criarProBanner, criarResumo, criarFooter } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const timemania = data.timemania || {};
    const times = timemania.times || {};
    
    // Componentes específicos
    const distribuicaoHtml = renderizarBarraHorizontal(
        timemania.distribuicaoDezenas || [],
        'label',
        'quantidade'
    );
    
    const paresImparesHtml = renderizarBarraHorizontal(
        timemania.paresImpares || [],
        'proporcao',
        'quantidade'
    );
    
    const rankingTimes = (times.ranking || []).map(item => ({
        nome: item.time,
        quantidade: item.quantidade
    }));
    const rankingHtml = renderizarBarraHorizontal(
        rankingTimes.slice(0, 10),
        'nome',
        'quantidade'
    );
    
    const resumoIA = renderizarResumoIA(timemania.resumoIA || []);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${distribuicaoHtml}
        ${paresImparesHtml}
        ${rankingHtml}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
