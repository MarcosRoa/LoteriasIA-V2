// public/js/estatisticas/loterias/diadesorte.js

// ============================================
// DIA DE SORTE - COM MÊS  02/07/2026
// ============================================
// ============================================
// DIA DE SORTE - COM MÊS
// ============================================

import { renderizarBase, renderizarExtras, renderizarHeatmap, renderizarResumoIA } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    
    const elementosExtras = data.elementosExtras || [];
    const nomeElemento = data.nomeElemento || 'Mês de Sorte';
    
    // Meses extras
    const mesesHtml = renderizarExtras(elementosExtras, nomeElemento, '📅', userData.isPro);
    
    // Heatmap dos meses
    const mesesHeatmap = elementosExtras.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade
    }));
    const heatmap = renderizarHeatmap(mesesHeatmap, '📊 Distribuição dos Meses');
    
    // Resumo IA
    const resumoIA = renderizarResumoIA([
        `Dia de Sorte: ${data.filteredDraws || data.totalDraws || 0} concursos analisados`,
        `Mês mais frequente: ${elementosExtras?.[0]?.nome || 'N/A'} (${elementosExtras?.[0]?.quantidade || 0} vezes)`,
        `Mês menos frequente: ${elementosExtras?.[elementosExtras.length - 1]?.nome || 'N/A'} (${elementosExtras?.[elementosExtras.length - 1]?.quantidade || 0} vezes)`
    ]);
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${mesesHtml}
        ${heatmap}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
