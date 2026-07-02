// public/js/estatisticas/loterias/supersete.js

// ============================================
// SUPER SETE - 7 COLUNAS   02/07/2026
// ============================================
// ============================================
// SUPER SETE - 7 COLUNAS
// ============================================

import { 
    criarProBanner, 
    criarResumo
} from '../renderers/components/resumo.js';

import { criarFooter } from '../renderers/components/footer.js';

// ============================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================

function renderizarHeatmap(columns) {
    if (!columns || columns.length === 0) return '';
    
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
            <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">📊 HEATMAP - 0 a 9 × 7 Colunas</h5>
            <p style="color: #94a3b8; font-size: 11px; margin-bottom: 12px;">💰 Quanto mais escura, maior a frequência</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; min-width: 400px;">
                <thead>
                    <tr>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">Nº</th>
                        ${columnStats.map(s => `<th style="padding: 8px; text-align: center; color: ${s.cor}; font-weight: 600;">C${s.coluna}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let num = 0; num <= 9; num++) {
        html += `<tr>`;
        html += `<td style="padding: 6px 8px; text-align: center; font-weight: 600; color: #e2e8f0;">${num}</td>`;
        columnStats.forEach(stat => {
            const freq = stat.frequencia[num] || 0;
            const intensidade = maxGlobal > 0 ? Math.round((freq / maxGlobal) * 100) : 0;
            const cor = intensidade > 80 ? '#22c55e' : intensidade > 60 ? '#f59e0b' : intensidade > 40 ? '#eab308' : '#64748b';
            const texto = intensidade > 40 ? '#0f172a' : '#e2e8f0';
            html += `
                <td style="padding: 6px 8px; text-align: center; background: ${cor}; color: ${texto}; border-radius: 4px; font-weight: ${intensidade > 40 ? 'bold' : 'normal'};">
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

function renderizarAnaliseColunas(columns) {
    if (!columns || columns.length === 0) return '';
    
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    
    let html = '';
    
    columns.forEach((col, idx) => {
        const coluna = idx + 1;
        const cor = cores[idx % cores.length];
        const freq = new Array(10).fill(0);
        col.forEach(num => {
            if (num >= 0 && num <= 9) freq[num]++;
        });
        
        const total = col.length;
        const maxFreq = Math.max(...freq);
        
        const ranking = freq.map((qtd, num) => ({ numero: num, quantidade: qtd }))
            .sort((a, b) => b.quantidade - a.quantidade);
        
        const maisFrequentes = ranking.slice(0, 3);
        const menosFrequentes = ranking.slice(-3).reverse();
        
        html += `
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid ${cor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <h5 style="color: ${cor}; font-size: 16px; margin: 0;">📊 Coluna ${coluna}</h5>
                    <div style="display: flex; gap: 20px; font-size: 12px; color: #94a3b8;">
                        <span>🔥 Mais: ${maisFrequentes.map(f => f.numero).join(', ')}</span>
                        <span>❄️ Menos: ${menosFrequentes.map(f => f.numero).join(', ')}</span>
                        <span>📊 Total: ${total}</span>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 3px;">
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
                        
                        return `
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 12px; width: 20px; text-align: center; color: #e2e8f0; font-weight: ${diferenca > 2 ? 'bold' : 'normal'};">${num}</span>
                                <div style="flex: 1; height: 20px; background: #0f172a; border-radius: 4px; overflow: hidden;">
                                    <div style="height: 100%; width: ${Math.max(pct, 2)}%; background: ${corBarra}; border-radius: 4px; min-width: 2px; transition: width 0.3s;"></div>
                                </div>
                                <span style="color: #94a3b8; font-size: 11px; width: 30px; text-align: right;">${qtd}</span>
                                <span style="color: ${corBarra}; font-size: 11px; width: 60px; text-align: right; font-weight: 600;">
                                    ${pctReal.toFixed(1)}%
                                    ${seta ? `<span style="color: ${corSeta};"> ${seta}</span>` : ''}
                                </span>
                                <span style="font-size: 10px; color: #64748b; width: 80px; text-align: right;">
                                    ${diferenca > 2 ? '🔥 Acima' : diferenca < -2 ? '❄️ Abaixo' : '⚪ Normal'}
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    return html;
}

function renderizarRankingColunas(columns) {
    if (!columns || columns.length === 0) return '';
    
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    
    const stats = columns.map((col, idx) => {
        const freq = new Array(10).fill(0);
        col.forEach(num => {
            if (num >= 0 && num <= 9) freq[num]++;
        });
        
        const total = col.length;
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
        <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-top: 20px; overflow-x: auto;">
            <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">📊 RANKING POR COLUNA</h5>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 600px;">
                <thead>
                    <tr style="background: #334155;">
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">Coluna</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">🔥 Mais Frequente</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">%</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">❄️ Menos Frequente</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">%</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">⚖️ Equilíbrio</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.map(s => `
                        <tr style="border-bottom: 1px solid #1e293b;">
                            <td style="padding: 6px 8px; text-align: center; color: ${s.cor}; font-weight: 600;">C${s.coluna}</td>
                            <td style="padding: 6px 8px; text-align: center; color: #f59e0b; font-weight: 600;">${s.maisFrequente}</td>
                            <td style="padding: 6px 8px; text-align: center; color: #94a3b8;">${s.pctMais}%</td>
                            <td style="padding: 6px 8px; text-align: center; color: #38bdf8; font-weight: 600;">${s.menosFrequente}</td>
                            <td style="padding: 6px 8px; text-align: center; color: #94a3b8;">${s.pctMenos}%</td>
                            <td style="padding: 6px 8px; text-align: center; color: ${s.corEquilibrio}; font-weight: 600;">${s.equilibrio}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderizarResumoIA(columns, totalDraws) {
    if (!columns || columns.length === 0) return '';
    
    const insights = [];
    
    columns.forEach((col, idx) => {
        const freq = new Array(10).fill(0);
        col.forEach(num => {
            if (num >= 0 && num <= 9) freq[num]++;
        });
        
        const total = col.length;
        const media = total / 10;
        
        const acima = freq.map((qtd, num) => ({ num, qtd, diff: qtd - media }))
            .filter(f => f.diff > media * 0.3)
            .map(f => f.num);
        
        const abaixo = freq.map((qtd, num) => ({ num, qtd, diff: qtd - media }))
            .filter(f => f.diff < -media * 0.3)
            .map(f => f.num);
        
        if (acima.length > 0) {
            insights.push(`Coluna ${idx + 1}: números ${acima.join(', ')} estão acima da média`);
        }
        if (abaixo.length > 0) {
            insights.push(`Coluna ${idx + 1}: números ${abaixo.join(', ')} estão abaixo da média`);
        }
    });
    
    const todosNumeros = columns.flat();
    const freqGlobal = new Array(10).fill(0);
    todosNumeros.forEach(num => {
        if (num >= 0 && num <= 9) freqGlobal[num]++;
    });
    
    const totalGlobal = todosNumeros.length;
    const mediaGlobal = totalGlobal / 10;
    
    const numerosQuentes = freqGlobal.map((qtd, num) => ({ num, qtd }))
        .filter(f => f.qtd > mediaGlobal * 1.2)
        .map(f => f.num);
    
    const numerosFrios = freqGlobal.map((qtd, num) => ({ num, qtd }))
        .filter(f => f.qtd < mediaGlobal * 0.8)
        .map(f => f.num);
    
    if (numerosQuentes.length > 0) {
        insights.push(`Globalmente, os números ${numerosQuentes.join(', ')} aparecem acima da média em várias colunas`);
    }
    if (numerosFrios.length > 0) {
        insights.push(`Globalmente, os números ${numerosFrios.join(', ')} estão abaixo da média esperada`);
    }
    
    insights.push(`📊 Baseado em ${totalDraws} concursos analisados`);
    insights.push(`🎯 7 colunas independentes com números de 0 a 9`);
    
    return `
        <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; margin-top: 20px;">
            <h4 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px;">🤖 Resumo Inteligente</h4>
            <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
                ${insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
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
    const resumoIA = renderizarResumoIA(columns, totalDraws);
    const footer = criarFooter(totalDraws, '7 colunas', 'números de 0 a 9');
    
    return `
        ${proBanner}
        ${resumo}
        ${heatmap}
        ${analise}
        ${ranking}
        ${resumoIA}
        ${footer}
    `;
}

export default { renderizar };
