// ============================================
// CAMINHO: public/js/estatisticas/renderers/components/extras.js
// ============================================
// COMPONENTE: ELEMENTOS EXTRAS (VERSÃO CORRIGIDA)
// ============================================

import { criarItemStats } from './cards.js';

/**
 * Renderiza elementos extras (times, meses, trevos)
 */
export function renderizarExtras(elementos, titulo, icone, isPro = false) {
    if (!elementos || elementos.length === 0) return '';
    
    return `
        <div class="milionaria-trevos-card" style="margin-top: 20px; background: var(--bg-card); border-radius: var(--radius); padding: 15px; border: 2px solid var(--border); display: block !important;">
            <h4 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--border); display: flex; align-items: center; gap: 8px;">
                ${icone} ${titulo}
            </h4>
            <div class="stats-list" style="max-height: 300px; overflow-y: auto;">
                ${elementos.map(item => 
                    criarItemStats(item.nome, item.quantidade, isPro)
                ).join('')}
            </div>
        </div>
    `;
}
