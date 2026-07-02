//public/js/estatisticas/loterias/milionaria.js

// ============================================
// +MILIONÁRIA - COM TREVOS  02/07/2026
// ============================================
// ============================================
// +MILIONÁRIA - COM TREVOS
// ============================================

import { renderizarBase, renderizarBarraHorizontal, renderizarResumoIA, renderizarExtras } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const trevos = data.trevos || {};
    
    // Frequência dos trevos
    const freqTrevos = (trevos.frequencia || []).map(item => ({
        nome: `Trevo ${item.trevo}`,
        quantidade: item.quantidade,
        percentual: item.percentual
    }));
    const freqHtml = renderizarBarraHorizontal(
        freqTrevos,
        'nome',
        'quantidade',
        ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899']
    );
    
    // Pares de trevos
    const paresTrevos = (trevos.pares || []).map(item => ({
        nome: `${item.par[0]}-${item.par[1]}`,
        quantidade: item.quantidade
    }));
    const paresHtml = renderizarBarraHorizontal(
        paresTrevos.slice(0, 10),
        'nome',
        'quantidade',
        ['#f59e0b', '#38bdf8', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#f43f5e']
    );
    
    // Resumo IA
    const resumoIA = renderizarResumoIA(trevos.resumoIA || []);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${freqHtml ? `<div style="margin-top: 20px;"><h4 style="color: #f59e0b; font-size: 16px;">🍀 Frequência dos Trevos</h4>${freqHtml}</div>` : ''}
        ${paresHtml ? `<div style="margin-top: 20px;"><h4 style="color: #f59e0b; font-size: 16px;">🍀🍀 Pares de Trevos</h4>${paresHtml}</div>` : ''}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
