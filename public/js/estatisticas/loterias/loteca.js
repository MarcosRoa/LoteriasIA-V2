// public/js/estatisticas/loterias/loteca.js

// ============================================
// LOTECA
// ============================================

import { criarProBanner, criarResumo, criarFooter } from '../core/utils.js';

/**
 * Renderiza Loteca com estatísticas de jogos
 */
export function renderizar(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const isPro = userData.isPro || false;
    const loteca = data.loteca || {};
    const { frequenciaGlobal, frequenciaPorJogo } = loteca;
    
    const proBanner = !isPro ? criarProBanner() : '';
    const resumo = criarResumo(totalDraws, dataInicio, dataFim, periodo);
    
    let html = `
        ${proBanner}
        ${resumo}
        
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>📊 FREQUÊNCIA GLOBAL</h4>
                <div class="stats-list">
                    ${frequenciaGlobal ? frequenciaGlobal.map(item => `
                        <div class="stats-item">
                            <span class="${isPro ? 'numero' : 'numero-pro'}">${isPro ? item.resultado : '⭐⭐ PRO ⭐⭐'}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="color: var(--text-secondary); margin-bottom: 15px;">📊 FREQUÊNCIA POR JOGO</h4>
            <div class="loteca-stats-grid">
                ${frequenciaPorJogo ? frequenciaPorJogo.map(jogo => `
                    <div class="loteca-jogo-card">
                        <h5>⚽ Jogo ${jogo.jogo}</h5>
                        <div class="loteca-bar">
                            <div class="casa" style="width: ${(jogo.casa / jogo.total * 100) || 0}%;"></div>
                            <div class="empate" style="width: ${(jogo.empate / jogo.total * 100) || 0}%;"></div>
                            <div class="fora" style="width: ${(jogo.fora / jogo.total * 100) || 0}%;"></div>
                        </div>
                        <div class="loteca-legend">
                            <span>🏠 Casa: ${jogo.casa}</span>
                            <span>🤝 Empate: ${jogo.empate}</span>
                            <span>✈️ Fora: ${jogo.fora}</span>
                            <span>📊 Total: ${jogo.total}</span>
                        </div>
                    </div>
                `).join('') : ''}
            </div>
        </div>
        
        ${criarFooter(totalDraws, config.numerosCSV, '14 jogos por concurso')}
    `;
    
    return html;
}

export default { renderizar };
