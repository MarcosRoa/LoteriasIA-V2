// public/js/estatisticas/loterias/loteca.js

// ============================================
// LOTECA  01/07/2026
// ============================================

// ============================================
// LOTECA
// ============================================

import { renderizarBase } from '../renderers/base.js';

export function renderizar(data, config, userData, periodo) {
    const base = renderizarBase(data, config, userData, periodo);
    const loteca = data.loteca || {};
    const { frequenciaGlobal, frequenciaPorJogo } = loteca;
    
    let jogosHtml = '';
    if (frequenciaPorJogo && frequenciaPorJogo.length > 0) {
        jogosHtml = `
            <div style="margin-top: 20px;">
                <h4 style="color: var(--text-secondary); margin-bottom: 15px;">📊 FREQUÊNCIA POR JOGO</h4>
                <div class="loteca-stats-grid">
                    ${frequenciaPorJogo.map(jogo => `
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
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${jogosHtml}
        ${base.footer}
    `;
}

export default { renderizar };
