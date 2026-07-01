//public/js/estatisticas/renderers/components/extras.js
// ============================================
// COMPONENTE: ELEMENTOS EXTRAS
// ============================================

import { criarItemStats } from './cards.js';

export function renderizarExtras(elementos, titulo, icone, isPro = false) {
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
