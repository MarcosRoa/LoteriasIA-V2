// renderers/components/helpers.js

// ============================================
// HELPERS - FUNÇÕES COMPARTILHADAS
// ============================================

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
