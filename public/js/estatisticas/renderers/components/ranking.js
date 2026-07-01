//public/js/estatisticas/renderers/components/ranking.js

// ============================================
// COMPONENTE: RANKING
// ============================================

export function renderizarRanking(dados, titulo, cor, medalhas = ['🥇', '🥈', '🥉', '4º', '5º', '6º', '7º', '8º', '9º', '10º']) {
    if (!dados || dados.length === 0) return '';
    
    return `
        <div style="background: #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid ${cor};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <h5 style="color: ${cor}; font-size: 14px; margin: 0;">📊 ${titulo}</h5>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 4px;">
                ${dados.slice(0, 10).map((item, idx) => `
                    <div style="background: #0f172a; border-radius: 6px; padding: 4px 8px; text-align: center; border: 1px solid ${cor}20;">
                        <div style="font-size: 10px; color: #94a3b8;">${medalhas[idx] || `${idx + 1}º`}</div>
                        <div style="font-size: 18px; font-weight: bold; color: ${cor};">${item.nome || item.numero}</div>
                        <div style="font-size: 10px; color: #94a3b8;">
                            ${item.quantidade || item.percentual?.toFixed(1) || 0}%
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
