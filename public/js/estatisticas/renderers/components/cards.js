//public/js/estatisticas/renderers/components/cards.js

// ============================================
// COMPONENTE: CARDS DE ESTATÍSTICAS  01/07/2026
// ============================================

// ============================================
// COMPONENTE: CARDS DE ESTATÍSTICAS
// ============================================

import { formatarNumero, formatarDupla, formatarTripla } from '../../core/utils.js';

/**
 * Cria um item de estatística individual
 */
export function criarItemStats(label, quantidade, isPro = false) {
    const labelClass = isPro ? 'numero' : 'numero-pro';
    const labelDisplay = isPro ? label : '⭐⭐ PRO ⭐⭐';
    return `
        <div class="stats-item">
            <span class="${labelClass}">${labelDisplay}</span>
            <span class="quantidade">${quantidade} vez(es)</span>
        </div>
    `;
}

/**
 * Cria os cards de estatísticas (Mais/Menos/Duplas/Triplas)
 */
export function criarCards(maisSorteados, menosSorteados, duplas, triplas, isPro, incluirZero) {
    return `
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
}
