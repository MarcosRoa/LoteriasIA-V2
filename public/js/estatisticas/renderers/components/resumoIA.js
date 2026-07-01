//public/js/estatisticas/renderers/components/resumoIA.js

// ============================================
// COMPONENTE: RESUMO IA  01/07/2026
// ============================================
// ============================================
// COMPONENTE: RESUMO IA
// ============================================

/**
 * Renderiza o resumo inteligente (insights)
 */
export function renderizarResumoIA(insights) {
    if (!insights || insights.length === 0) return '';
    
    return `
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; margin-top: 20px;">
            <h4 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px;">🤖 Resumo Inteligente</h4>
            <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
                ${insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
        </div>
    `;
}
