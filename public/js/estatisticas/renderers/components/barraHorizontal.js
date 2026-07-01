//public/js/estatisticas/renderers/components/barraHorizontal.js

// ============================================
// COMPONENTE: BARRA HORIZONTAL 01/07/2026
// ============================================
// ============================================
// COMPONENTE: BARRA HORIZONTAL
// ============================================

/**
 * Renderiza um gráfico de barras horizontais
 */
export function renderizarBarraHorizontal(dados, labelKey = 'nome', valueKey = 'quantidade', cores = ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6']) {
    if (!dados || dados.length === 0) return '';
    
    const maxValor = Math.max(...dados.map(d => d[valueKey] || 0));
    
    return `
        <div style="background: #1e293b; border-radius: 8px; padding: 16px;">
            ${dados.slice(0, 10).map((item, idx) => {
                const valor = item[valueKey] || 0;
                const pct = maxValor > 0 ? (valor / maxValor * 100) : 0;
                const cor = cores[idx % cores.length];
                return `
                    <div class="trevo-heatmap-item">
                        <span class="label" style="color: ${cor}; font-weight: 600; width: 120px;">${item[labelKey]}</span>
                        <div class="bar">
                            <div class="fill" style="width: ${Math.max(pct, 2)}%; background: ${cor};"></div>
                        </div>
                        <span class="qtd">${valor}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}
