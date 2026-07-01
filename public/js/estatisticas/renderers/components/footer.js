//public/js/estatisticas/renderers/components/footer.js

// ============================================
// COMPONENTE: FOOTER
// ============================================

export function criarFooter(totalDraws, numerosPorConcurso, extraInfo = '') {
    return `
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 ${numerosPorConcurso} números por concurso
                ${extraInfo ? ` | ${extraInfo}` : ''}
            </div>
        </div>
    `;
}
