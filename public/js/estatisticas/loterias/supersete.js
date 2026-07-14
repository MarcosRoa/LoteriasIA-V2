// ============================================
// CAMINHO: public/js/estatisticas/loterias/supersete.js
// ============================================
// SUPER SETE - 7 COLUNAS (VERSÃO CORRIGIDA)
// ============================================

import { 
    criarProBanner, 
    criarResumo
} from '../renderers/components/resumo.js';

import { criarFooter } from '../renderers/components/footer.js';

// ============================================
// RENDERIZAR HEATMAP
// ============================================

function renderizarHeatmap(columns) {
    if (!columns || columns.length === 0) {
        return '<div class="error-stats">⚠️ Nenhum dado disponível para o heatmap</div>';
    }
    
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    
    const columnStats = columns.map((col, index) => {
        const freq = col; // Já é a frequência
        const total = freq.reduce((a, b) => a + b, 0);
        const maxFreq = Math.max(...freq);
        return {
            coluna: index + 1,
            frequencia: freq,
            total: total,
            maxFreq: maxFreq,
            cor: cores[index % cores.length]
        };
    });
    
    const maxGlobal = Math.max(...columnStats.flatMap(s => s.frequencia));
    
    let html = `
        <div class="heatmap-container">
            <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">📊 HEATMAP - 0 a 9 × 7 Colunas</h5>
            <p style="color: #94a3b8; font-size: 11px; margin-bottom: 12px;">💰 Quanto mais escura, maior a frequência</p>
            <table>
                <thead>
                    <tr>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">Nº</th>
                        ${columnStats.map(s => `<th style="padding: 8px; text-align: center; color: ${s.cor}; font-weight: 600;">C${s.coluna}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let num = 0; num <= 9; num++) {
        html += `<tr><td style="padding: 6px 8px; text-align: center; font-weight: 600; color: #e2e8f0;">${num}</td>`;
        columnStats.forEach(stat => {
            const freq = stat.frequencia[num] || 0;
            const intensidade = maxGlobal > 0 ? Math.round((freq / maxGlobal) * 100) : 0;
            const cor = intensidade > 80 ? '#22c55e' : intensidade > 60 ? '#f59e0b' : intensidade > 40 ? '#eab308' : '#64748b';
            const texto = intensidade > 40 ? '#0f172a' : '#e2e8f0';
            html += `
                <td style="background: ${cor}; color: ${texto}; font-weight: ${intensidade > 40 ? 'bold' : 'normal'};">
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
// RENDERIZAR ANÁLISE POR COLUNA
// ============================================

function renderizarAnaliseColunas(columns) {
    if (!columns || columns.length === 0) return '';
    
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    let html = '';
    
    columns.forEach((col, idx) => {
        const coluna = idx + 1;
        const cor = cores[idx % cores.length];
        const freq = col;
        const total = freq.reduce((a, b) => a + b, 0);
        const maxFreq = Math.max(...freq);
        
        const ranking = freq.map((qtd, num) => ({ numero: num, quantidade: qtd }))
            .sort((a, b) => b.quantidade - a.quantidade);
        
        const maisFrequentes = ranking.slice(0, 3);
        const menosFrequentes = ranking.slice(-3).reverse();
        
        html += `
            <div class="coluna-analise" style="border-left-color: ${cor};">
                <div class="header">
                    <h5 style="color: ${cor};">📊 Coluna ${coluna}</h5>
                    <div style="display: flex; gap: 20px; font-size: 12px; color: #94a3b8;">
                        <span>🔥 Mais: ${maisFrequentes.map(f => f.numero).join(', ')}</span>
                        <span>❄️ Menos: ${menosFrequentes.map(f => f.numero).join(', ')}</span>
                        <span>📊 Total: ${total}</span>
                    </div>
                </div>
                
                <div class="bar-container">
                    ${freq.map((qtd, num) => {
                        const pct = maxFreq > 0 ? (qtd / maxFreq * 100) : 0;
                        const pctReal = total > 0 ? (qtd / total * 100) : 0;
                        const diferenca = pctReal - 10;
                        
                        let corBarra;
                        if (diferenca > 5) corBarra = '#22c55e';
                        else if (diferenca > 2) corBarra = '#4ade80';
                        else if (diferenca > -2) corBarra = '#f59e0b';
                        else if (diferenca > -5) corBarra = '#f97316';
                        else corBarra = '#ef4444';
                        
                        const seta = diferenca > 1 ? '▲' : diferenca < -1 ? '▼' : '';
                        const corSeta = diferenca > 1 ? '#22c55e' : diferenca < -1 ? '#ef4444' : 'transparent';
                        
                        let status = '⚪ Normal';
                        if (diferenca > 2) status = '🔥 Acima';
                        else if (diferenca < -2) status = '❄️ Abaixo';
                        
                        return `
                            <div class="bar-row">
                                <span class="label">${num}</span>
                                <div class="bar-track">
                                    <div class="bar-fill" style="width: ${Math.max(pct, 2)}%; background: ${corBarra};"></div>
                                </div>
                                <span class="value">${qtd}</span>
                                <span class="percent" style="color: ${corBarra};">
                                    ${pctReal.toFixed(1)}%
                                    ${seta ? `<span style="color: ${corSeta};"> ${seta}</span>` : ''}
                                </span>
                                <span class="status">${status}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    return html;
}

// ============================================
// RENDERIZAR RANKING POR COLUNA
// ============================================

function renderizarRankingColunas(columns) {
    if (!columns || columns.length === 0) return '';
    
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    
    const stats = columns.map((col, idx) => {
        const freq = col;
        const total = freq.reduce((a, b) => a + b, 0);
        const maxFreq = Math.max(...freq);
        const media = total / 10;
        
        const desvio = Math.sqrt(freq.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / 10);
        const equilibrio = desvio < media * 0.3 ? 'Excelente' : desvio < media * 0.5 ? 'Boa' : 'Concentrada';
        const corEquilibrio = desvio < media * 0.3 ? '#22c55e' : desvio < media * 0.5 ? '#f59e0b' : '#ef4444';
        
        const maisFreq = freq.indexOf(maxFreq);
        const menosFreq = freq.indexOf(Math.min(...freq));
        
        return {
            coluna: idx + 1,
            maisFrequente: maisFreq,
            pctMais: (maxFreq / total * 100).toFixed(1),
            menosFrequente: menosFreq,
            pctMenos: (Math.min(...freq) / total * 100).toFixed(1),
            equilibrio,
            corEquilibrio,
            cor: cores[idx % cores.length]
        };
    });
    
    return `
        <div class="ranking-container">
            <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">📊 RANKING POR COLUNA</h5>
            <table>
                <thead>
                    <tr>
                        <th>Coluna</th>
                        <th>🔥 Mais Frequente</th>
                        <th>%</th>
                        <th>❄️ Menos Frequente</th>
                        <th>%</th>
                        <th>⚖️ Equilíbrio</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(s => `
                        <tr>
                            <td style="color: ${s.cor}; font-weight: 600;">C${s.coluna}</td>
                            <td style="color: #f59e0b; font-weight: 600;">${s.maisFrequente}</td>
                            <td>${s.pctMais}%</td>
                            <td style="color: #38bdf8; font-weight: 600;">${s.menosFrequente}</td>
                            <td>${s.pctMenos}%</td>
                            <td style="color: ${s.corEquilibrio}; font-weight: 600;">${s.equilibrio}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ============================================
// RENDERIZADOR PRINCIPAL
// ============================================

export function renderizar(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const isPro = userData.isPro || false;
    const columns = data.columns || [];
    
    const proBanner = !isPro ? criarProBanner() : '';
    const resumo = criarResumo(totalDraws, dataInicio, dataFim, periodo);
    const heatmap = renderizarHeatmap(columns);
    const analise = renderizarAnaliseColunas(columns);
    const ranking = renderizarRankingColunas(columns);
    const footer = criarFooter(totalDraws, '7 colunas', 'números de 0 a 9');
    
    return `
        ${proBanner}
        ${resumo}
        ${heatmap}
        ${analise}
        ${ranking}
        ${footer}
    `;
}

export default { renderizar };
