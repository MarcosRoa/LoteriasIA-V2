// public/js/estatisticas/renderers/base.js
// ============================================
// RENDERIZADOR BASE - PADRÃO PARA LOTERIAS
// ============================================

import { 
    calcularFrequenciaNumeros,
    calcularDuplasMaisSorteadas,
    calcularTriplasMaisSorteadas
} from '../core/calculos.js';

import {
    formatarNumero,
    formatarDupla,
    formatarTripla,
    criarItemStats,
    criarProBanner,
    criarResumo,
    criarFooter
} from '../core/utils.js';

/**
 * Renderiza estatísticas padrão para qualquer loteria
 */
export function renderizarBase(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    
    const maisSorteados = data.maisSorteados || [];
    const menosSorteados = data.menosSorteados || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    
    const isPro = userData.isPro || false;
    const incluirZero = config.incluirZero || false;
    
    const proBanner = !isPro ? criarProBanner() : '';
    const resumo = criarResumo(totalDraws, dataInicio, dataFim, periodo);
    
    // Cards
    let cardsHtml = `
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS (Top 20)</h4>
                <div class="stats-list">
                    ${maisSorteados.length > 0 ? maisSorteados.map(item => 
                        criarItemStats(formatarNumero(item.numero, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS (Bottom 20)</h4>
                <div class="stats-list">
                    ${menosSorteados.length > 0 ? menosSorteados.map(item => 
                        criarItemStats(formatarNumero(item.numero, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${duplas.length > 0 ? duplas.map(item => 
                        criarItemStats(formatarDupla(item.dupla, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma dupla encontrada
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${triplas.length > 0 ? triplas.map(item => 
                        criarItemStats(formatarTripla(item.tripla, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma tríade encontrada
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    const footer = criarFooter(totalDraws, config.numerosCSV);
    
    return `
        ${proBanner}
        ${resumo}
        ${cardsHtml}
        ${footer}
    `;
}

/**
 * Renderiza elementos extras (times, meses, trevos)
 */
export function renderizarElementosExtras(elementos, titulo, icone, isPro = false) {
    if (!elementos || elementos.length === 0) return '';
    
    return `
        <div class="milionaria-trevos-card">
            <h4>${icone} ${titulo}</h4>
            <div class="stats-list">
                ${elementos.map(item => 
                    criarItemStats(item.nome, item.quantidade, isPro)
                ).join('')}
            </div>
        </div>
    `;
}
