// public/js/estatisticas/renderers/components/heatmap.js

// ============================================
// COMPONENTE: HEATMAP 02/07/2026
// ============================================
// ============================================
// COMPONENTE: HEATMAP
// ============================================

/**
 * Renderiza um heatmap a partir de dados de frequência
 * Suporta dois formatos:
 * 1. Array de objetos: [{ numero: 1, quantidade: 45 }, ...]
 * 2. Array de arrays: [[1,2,3], [2,3,4], ...] (para Super Sete)
 */
export function renderizarHeatmap(dados, titulo = '📊 Heatmap', cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316']) {
    if (!dados || dados.length === 0) return '';
    
    // ============================================
    // CASO 1: Dados de frequência (objetos)
    // Exemplo: [{ numero: 1, quantidade: 45 }, ...]
    // ============================================
    if (dados[0] && typeof dados[0] === 'object' && 'numero' in dados[0] && 'quantidade' in dados[0]) {
        const maxFreq = Math.max(...dados.map(d => d.quantidade));
        
        let html = `
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">${titulo}</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;">
        `;
        
        dados.slice(0, 30).forEach(item => {
            const pct = maxFreq > 0 ? (item.quantidade / maxFreq * 100) : 0;
            const cor = pct > 80 ? '#22c55e' : pct > 60 ? '#f59e0b' : pct > 40 ? '#eab308' : '#64748b';
            const texto = pct > 40 ? '#0f172a' : '#e2e8f0';
            
            html += `
                <div style="background: ${cor}; color: ${texto}; border-radius: 4px; padding: 8px; text-align: center; font-weight: ${pct > 40 ? 'bold' : 'normal'};">
                    <div style="font-size: 16px;">${item.numero}</div>
                    <div style="font-size: 10px; opacity: 0.8;">${item.quantidade}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    // ============================================
    // CASO 2: Colunas (arrays de números) - Super Sete
    // Exemplo: [[1,2,3], [2,3,4], ...]
    // ============================================
    if (Array.isArray(dados[0]) && dados[0].length > 0) {
        const columns = dados;
        const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
        
        const columnStats = columns.map((col, index) => {
            const freq = new Array(10).fill(0);
            col.forEach(num => {
                if (num >= 0 && num <= 9) freq[num]++;
            });
            return {
                coluna: index + 1,
                frequencia: freq,
                total: col.length,
                cor: cores[index % cores.length],
                maxFreq: Math.max(...freq)
            };
        });
        
        const maxGlobal = Math.max(...columnStats.flatMap(s => s.frequencia));
        
        let html = `
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px; overflow-x: auto;">
                <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">${titulo}</h5>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 400px;">
                    <thead>
                        <tr>
                            <th style="padding: 6px; text-align: center; color: #94a3b8;">Nº</th>
                            ${columnStats.map(s => `<th style="padding: 6px; text-align: center; color: ${s.cor}; font-weight: 600;">C${s.coluna}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (let num = 0; num <= 9; num++) {
            html += `<tr>`;
            html += `<td style="padding: 4px 6px; text-align: center; font-weight: 600; color: #e2e8f0;">${num}</td>`;
            columnStats.forEach(stat => {
                const freq = stat.frequencia[num] || 0;
                const intensidade = maxGlobal > 0 ? Math.round((freq / maxGlobal) * 100) : 0;
                const cor = intensidade > 80 ? '#22c55e' : intensidade > 60 ? '#f59e0b' : intensidade > 40 ? '#eab308' : '#64748b';
                const texto = intensidade > 40 ? '#0f172a' : '#e2e8f0';
                html += `
                    <td style="padding: 4px 6px; text-align: center; background: ${cor}; color: ${texto}; border-radius: 4px; font-weight: ${intensidade > 40 ? 'bold' : 'normal'};">
                        ${freq}
                    </td>
                `;
            });
            html += `</tr>`;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }
    
    // ============================================
    // CASO 3: Formato desconhecido
    // ============================================
    return '';
}
