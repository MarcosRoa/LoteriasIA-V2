// public/js/estatisticas/renderers/components/heatmap.js

// ============================================
// COMPONENTE: HEATMAP
// ============================================

export function renderizarHeatmap(columns, cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316']) {
    if (!columns || columns.length === 0) return '';
    
    // Calcular estatísticas
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
            <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">📊 HEATMAP</h5>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 500px;">
                <thead>
                    <tr>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">Nº</th>
                        ${columnStats.map(s => `<th style="padding: 6px; text-align: center; color: ${s.cor}; font-weight: 600;">C${s.coluna}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let num = 0; num <= 9; num++) {
        html += `<tr><td style="padding: 4px; text-align: center; font-weight: 600; color: #e2e8f0;">${num}</td>`;
        columnStats.forEach(stat => {
            const freq = stat.frequencia[num] || 0;
            const intensidade = maxGlobal > 0 ? Math.round((freq / maxGlobal) * 100) : 0;
            const cor = intensidade > 80 ? '#22c55e' : intensidade > 60 ? '#f59e0b' : intensidade > 40 ? '#eab308' : '#64748b';
            const texto = intensidade > 40 ? '#0f172a' : '#e2e8f0';
            html += `
                <td style="padding: 4px; text-align: center; background: ${cor}; color: ${texto}; border-radius: 4px; font-weight: ${intensidade > 40 ? 'bold' : 'normal'};">
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
