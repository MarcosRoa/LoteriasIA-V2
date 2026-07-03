//public/js/estatisticas/core/utils.js
// ============================================
// UTILITÁRIOS COMPARTILHADOS  03/07/2026
// ============================================
// ============================================
// CAMINHO: public/js/estatisticas/core/utils.js
// ============================================
// UTILITÁRIOS - FUNÇÕES PURAS
// SEM DADOS EMBUTIDOS!
// ============================================

/**
 * Formata número com zero à esquerda
 */
export function formatarNumero(num, incluirZero = false) {
    if (num === 0 && incluirZero) return '00';
    return String(num).padStart(2, '0');
}

/**
 * Formata dupla para exibição
 */
export function formatarDupla(dupla, incluirZero = false) {
    return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
}

/**
 * Formata tripla para exibição
 */
export function formatarTripla(tripla, incluirZero = false) {
    return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
}

/**
 * Gera o HTML de um item de estatística
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
 * Gera o HTML do banner PRO
 */
export function criarProBanner() {
    return `
        <div class="pro-overlay" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; margin-bottom: 20px;">
            <span class="pro-badge-stats">⭐ PLANO PRO ⭐</span>
            <p style="margin-top: 10px; font-size: 13px;">Faça login com uma conta PRO para visualizar todos os números e estatísticas completas!</p>
            <button onclick="window.location.href='index.html'" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 8px 20px; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer; margin-top: 10px;">⭐ IR PARA O SISTEMA</button>
        </div>
    `;
}

/**
 * Gera o HTML do resumo de concursos
 */
export function criarResumo(totalDraws, dataInicio, dataFim, periodo) {
    const periodoTexto = periodo === 'all' ? 'Todos' : `${periodo} anos`;
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">Total de concursos</div>
                <div style="color: #38bdf8; font-size: 20px; font-weight: bold;">${totalDraws}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Data inicial</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: bold;">${dataInicio || 'N/A'}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Data final</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: bold;">${dataFim || 'N/A'}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Período</div>
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoTexto}</div>
            </div>
        </div>
    `;
}

/**
 * Gera o HTML do rodapé
 */
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
