// public/js/estatisticas/loterias/diadesorte.js

// ============================================
// DIA DE SORTE - COM MÊS
// ============================================

import { renderizarBase } from '../renderers/base.js';
import { renderizarElementosExtras, criarProBanner, criarResumo, criarFooter } from '../core/utils.js';

/**
 * Renderiza Dia de Sorte com estatísticas de meses
 */
export function renderizar(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const isPro = userData.isPro || false;
    const elementosExtras = data.elementosExtras || [];
    const nomeElemento = data.nomeElemento || 'Mês de Sorte';
    
    // Dezenas (usando base)
    const baseHtml = renderizarBase(data, config, userData, periodo);
    
    // Meses extras
    const mesesHtml = renderizarElementosExtras(elementosExtras, nomeElemento, '📅', isPro);
    
    // Montar HTML final
    const proBanner = !isPro ? criarProBanner() : '';
    const resumo = criarResumo(totalDraws, dataInicio, dataFim, periodo);
    const footer = criarFooter(totalDraws, config.numerosCSV, `1 ${nomeElemento} por concurso`);
    
    const baseCardsMatch = baseHtml.match(/<div class="stats-cards-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    const baseCards = baseCardsMatch ? baseCardsMatch[0] : '';
    
    return `
        ${proBanner}
        ${resumo}
        
        <!-- Dezenas -->
        ${baseCards}
        
        <!-- Meses -->
        <div style="margin-top: 20px;">
            <div class="milionaria-trevos-grid">
                ${mesesHtml}
            </div>
        </div>
        
        ${footer}
    `;
}

export default { renderizar };
