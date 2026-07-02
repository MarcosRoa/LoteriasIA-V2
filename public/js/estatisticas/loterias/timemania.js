//public/js/estatisticas/loterias/timemania.js

// ============================================
// TIMEMANIA - COM TIME DO CORAÇÃO  02/07/2026
// ============================================
// ============================================
// TIMEMANIA - COM TIME DO CORAÇÃO
// ============================================

import { renderizarBase, renderizarBarraHorizontal, renderizarResumoIA, renderizarExtras } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const timemania = data.timemania || {};
    const times = timemania.times || {};
    
    // Distribuição por dezenas
    const distribuicaoHtml = renderizarBarraHorizontal(
        timemania.distribuicaoDezenas || [],
        'label',
        'quantidade',
        ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6']
    );
    
    // Pares × Ímpares
    const paresImparesHtml = renderizarBarraHorizontal(
        timemania.paresImpares || [],
        'proporcao',
        'quantidade',
        ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444']
    );
    
    // Ranking dos Times
    const rankingTimes = (times.ranking || []).map(item => ({
        nome: item.time,
        quantidade: item.quantidade
    }));
    const rankingHtml = renderizarBarraHorizontal(
        rankingTimes.slice(0, 10),
        'nome',
        'quantidade',
        ['#f59e0b', '#38bdf8', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#f43f5e']
    );
    
    // Resumo IA
    const resumoIA = renderizarResumoIA(timemania.resumoIA || []);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${distribuicaoHtml ? `<div style="margin-top: 20px;">${distribuicaoHtml}</div>` : ''}
        ${paresImparesHtml ? `<div style="margin-top: 20px;">${paresImparesHtml}</div>` : ''}
        ${rankingHtml ? `<div style="margin-top: 20px;"><h4 style="color: #f59e0b; font-size: 16px;">⚽ Ranking dos Times</h4>${rankingHtml}</div>` : ''}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
