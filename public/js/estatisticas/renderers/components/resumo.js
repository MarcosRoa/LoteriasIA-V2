// public/js/estatisticas/renderers/components/resumo.js


// ============================================
// COMPONENTE: RESUMO  01/07/2026
// ============================================
// ============================================
// COMPONENTE: RESUMO
// ============================================

import { formatarPeriodo, formatarData } from '../../core/utils.js';

/**
 * Cria o banner PRO
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
 * Cria o resumo com informações dos concursos
 */
export function criarResumo(totalDraws, dataInicio, dataFim, periodo) {
    const periodoTexto = formatarPeriodo(periodo);
    
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">Total de concursos</div>
                <div style="color: #38bdf8; font-size: 20px; font-weight: bold;">${totalDraws}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Data inicial</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: bold;">${formatarData(dataInicio)}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Data final</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: bold;">${formatarData(dataFim)}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Período</div>
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoTexto}</div>
            </div>
        </div>
    `;
}
