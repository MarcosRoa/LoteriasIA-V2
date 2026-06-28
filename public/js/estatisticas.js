// ============================================
// ESTATISTICAS.js - Cálculo e exibição de estatísticas (28/06/2026)
// ============================================

// ============================================
// RENDERIZADOR SUPER SETE - VERSÃO MELHORADA
// ============================================

function renderizarSuperSete(data, config, userData, periodoSelecionado) {
    console.log('🔍 renderizarSuperSete chamada com data:', data);
    
    if (!data || !data.columns || data.columns.length === 0) {
        console.warn('⚠️ Nenhuma coluna encontrada:', data);
        return `
            <div class="error-stats">
                ⚠️ Nenhum dado disponível para Super Sete no período selecionado.
                <br>
                <small>Verifique se o backend está retornando a estrutura 'columns'.</small>
                <br><br>
                <button onclick="carregarEstatisticas()" style="background: #8b5cf6; border: none; padding: 8px 20px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">
                    🔄 Tentar novamente
                </button>
            </div>
        `;
    }
    
    const columns = data.columns || [];
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    
    console.log('📊 Columns:', columns.length, 'colunas');
    
    // Cores para cada coluna
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    const coresHex = ['#8B5CF6', '#38BDF8', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#F97316'];
    
    // Calcular estatísticas por coluna
    const columnStats = columns.map((col, index) => {
        const freq = new Array(10).fill(0);
        col.forEach(num => {
            if (num >= 0 && num <= 9) freq[num]++;
        });
        
        const ranking = freq.map((qtd, num) => ({ numero: num, quantidade: qtd }))
            .sort((a, b) => b.quantidade - a.quantidade);
        
        let maisFrequente = 0;
        let menosFrequente = 0;
        let qtdeMais = 0;
        let qtdeMenos = Infinity;
        
        for (let i = 0; i < 10; i++) {
            if (freq[i] > qtdeMais) {
                qtdeMais = freq[i];
                maisFrequente = i;
            }
            if (freq[i] < qtdeMenos) {
                qtdeMenos = freq[i];
                menosFrequente = i;
            }
        }
        
        const media = col.length / 10;
        const desvioPadrao = Math.sqrt(
            freq.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / 10
        );
        const isBalanced = desvioPadrao < media * 0.3;
        
        const sorted = freq.map((qtd, num) => ({ numero: num, quantidade: qtd })).sort((a, b) => b.quantidade - a.quantidade);
        const quentes = sorted.slice(0, 3).map(item => item.numero);
        const frios = sorted.slice(-3).reverse().map(item => item.numero);
        
        const ultimos = col.slice(-50);
        const freqUltimos = new Array(10).fill(0);
        ultimos.forEach(num => {
            if (num >= 0 && num <= 9) freqUltimos[num]++;
        });
        const rankingUltimos = freqUltimos.map((qtd, num) => ({ numero: num, quantidade: qtd }))
            .sort((a, b) => b.quantidade - a.quantidade);
        
        return {
            coluna: index + 1,
            frequencia: freq,
            ranking: ranking,
            rankingUltimos: rankingUltimos,
            maisFrequente,
            menosFrequente,
            qtdeMais,
            qtdeMenos,
            total: col.length,
            cor: cores[index % cores.length],
            corHex: coresHex[index % coresHex.length],
            media,
            desvioPadrao,
            isBalanced,
            quentes,
            frios,
            maxFreq: Math.max(...freq),
            tendenciaSubindo: rankingUltimos.slice(0, 3).map(item => item.numero),
            tendenciaDescendo: rankingUltimos.slice(-3).reverse().map(item => item.numero)
        };
    });
    
    // ============================================
    // 1. HEATMAP - Matriz de cores
    // ============================================
    let heatmapHtml = '';
    if (columns.length > 0) {
        const maxGlobal = Math.max(...columnStats.flatMap(s => s.frequencia));
        
        heatmapHtml = `
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px; overflow-x: auto;">
                <h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">📊 HEATMAP - Distribuição por Coluna</h5>
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
            heatmapHtml += `<tr><td style="padding: 4px; text-align: center; font-weight: 600; color: #e2e8f0;">${num}</td>`;
            columnStats.forEach(stat => {
                const freq = stat.frequencia[num] || 0;
                const intensidade = maxGlobal > 0 ? Math.round((freq / maxGlobal) * 100) : 0;
                const cor = intensidade > 80 ? '#22c55e' : intensidade > 60 ? '#f59e0b' : intensidade > 40 ? '#eab308' : '#64748b';
                const texto = intensidade > 40 ? '#0f172a' : '#e2e8f0';
                heatmapHtml += `
                    <td style="padding: 4px; text-align: center; background: ${cor}; color: ${texto}; border-radius: 4px; font-weight: ${intensidade > 40 ? 'bold' : 'normal'};">
                        ${freq}
                    </td>
                `;
            });
            heatmapHtml += `</tr>`;
        }
        
        heatmapHtml += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // ============================================
    // 2. TABELA RESUMO
    // ============================================
    let tabelaHtml = `
        <div style="overflow-x: auto; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 700px;">
                <thead>
                    <tr style="background: #334155;">
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">Coluna</th>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">🔥 Quentes</th>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">❄️ Frios</th>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">⚖️ Equilíbrio</th>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">📈 Tendência</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    columnStats.forEach(stat => {
        const tendenciaTexto = stat.tendenciaSubindo.join(', ');
        tabelaHtml += `
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 6px 8px; text-align: center; color: ${stat.cor}; font-weight: 600;">${stat.coluna}</td>
                <td style="padding: 6px 8px; text-align: center; color: #f59e0b; font-weight: 600;">
                    ${stat.quentes.map(n => `<span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 2px 6px; border-radius: 8px; margin: 0 2px; font-size: 11px;">${n}</span>`).join('')}
                </td>
                <td style="padding: 6px 8px; text-align: center; color: #38bdf8; font-weight: 600;">
                    ${stat.frios.map(n => `<span style="background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 6px; border-radius: 8px; margin: 0 2px; font-size: 11px;">${n}</span>`).join('')}
                </td>
                <td style="padding: 6px 8px; text-align: center; color: #94a3b8;">${stat.isBalanced ? '✅ Equilibrada' : '⚠️ Concentrada'}</td>
                <td style="padding: 6px 8px; text-align: center; color: #22c55e; font-weight: 600; font-size: 11px;">
                    ${tendenciaTexto || '—'}
                </td>
            </tr>
        `;
    });
    
    tabelaHtml += `</tbody></table></div>`;
    
    // ============================================
    // 3. RANKING POR COLUNA
    // ============================================
    let rankingHtml = '';
    columnStats.forEach(stat => {
        rankingHtml += `
            <div style="background: #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid ${stat.cor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h5 style="color: ${stat.cor}; font-size: 14px; margin: 0;">📊 Coluna ${stat.coluna} - Ranking</h5>
                    <span style="color: #94a3b8; font-size: 11px;">Total: ${stat.total}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 4px;">
        `;
        
        stat.ranking.forEach((item, idx) => {
            const pctReal = stat.total > 0 ? (item.quantidade / stat.total) * 100 : 0;
            const diferenca = pctReal - 10;
            const corDiferenca = diferenca > 3 ? '#22c55e' : diferenca < -3 ? '#ef4444' : '#f59e0b';
            const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
            
            rankingHtml += `
                <div style="background: #0f172a; border-radius: 6px; padding: 4px 8px; text-align: center; border: 1px solid ${stat.cor}20;">
                    <div style="font-size: 10px; color: #94a3b8;">${medalha}</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${stat.cor};">${item.numero}</div>
                    <div style="font-size: 10px; color: ${corDiferenca}; font-weight: 600;">
                        ${pctReal.toFixed(1)}%
                        ${diferenca > 1 ? `+${diferenca.toFixed(1)}%` : diferenca < -1 ? `${diferenca.toFixed(1)}%` : ''}
                    </div>
                </div>
            `;
        });
        
        rankingHtml += `
                </div>
            </div>
        `;
    });
    
    // ============================================
    // 4. ANÁLISE POR COLUNA
    // ============================================
    let colunasHtml = '';
    columnStats.forEach(stat => {
        const maxFreq = stat.maxFreq;
        
        colunasHtml += `
            <div style="background: #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 4px solid ${stat.cor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                    <h5 style="color: ${stat.cor}; font-size: 14px; margin: 0;">📊 Coluna ${stat.coluna}</h5>
                    <div style="display: flex; gap: 12px; font-size: 11px; color: #94a3b8;">
                        <span>🔥 Quentes: ${stat.quentes.join(', ')}</span>
                        <span>❄️ Frios: ${stat.frios.join(', ')}</span>
                        <span>⚖️ ${stat.isBalanced ? 'Equilibrada' : 'Concentrada'}</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 3px;">
        `;
        
        for (let i = 0; i < 10; i++) {
            const freq = stat.frequencia[i];
            const pct = maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
            const pctReal = stat.total > 0 ? (freq / stat.total) * 100 : 0;
            const diferenca = pctReal - 10;
            
            let corBarra, labelStatus;
            if (diferenca > 5) { corBarra = '#22c55e'; labelStatus = '🔥 Muito acima'; }
            else if (diferenca > 2) { corBarra = '#4ade80'; labelStatus = '🟢 Acima'; }
            else if (diferenca > -2) { corBarra = '#f59e0b'; labelStatus = '⚪ Normal'; }
            else if (diferenca > -5) { corBarra = '#f97316'; labelStatus = '🟡 Abaixo'; }
            else { corBarra = '#ef4444'; labelStatus = '🔴 Muito abaixo'; }
            
            const isQuente = stat.quentes.includes(i);
            const isFrio = stat.frios.includes(i);
            
            colunasHtml += `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: ${isQuente ? '#ef4444' : isFrio ? '#38bdf8' : '#e2e8f0'}; font-size: 11px; width: 20px; text-align: center; font-weight: ${isQuente || isFrio ? 'bold' : 'normal'};">${i}</span>
                    <div style="flex: 1; height: 18px; background: #0f172a; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.max(pct, 2)}%; background: ${corBarra}; border-radius: 4px; min-width: 2px;"></div>
                    </div>
                    <span style="color: #94a3b8; font-size: 10px; width: 30px; text-align: right;">${freq}</span>
                    <span style="color: ${corBarra}; font-size: 10px; width: 60px; text-align: right; font-weight: 600;">
                        ${pctReal.toFixed(1)}%
                        ${diferenca > 1 ? `<span style="color: #22c55e;">▲${diferenca.toFixed(1)}%</span>` : diferenca < -1 ? `<span style="color: #ef4444;">▼${Math.abs(diferenca).toFixed(1)}%</span>` : ''}
                    </span>
                    <span style="font-size: 9px; color: #64748b; width: 70px; text-align: right;">${labelStatus}</span>
                </div>
            `;
        }
        
        colunasHtml += `
                </div>
            </div>
        `;
    });
    
    // ============================================
    // 5. RESUMO IA MELHORADO
    // ============================================
    let resumoIA = '';
    try {
        const insights = [];
        
        const balanced = columnStats.filter(s => s.isBalanced);
        const concentrated = columnStats.filter(s => !s.isBalanced);
        if (balanced.length > 0) {
            insights.push(`As colunas ${balanced.map(s => s.coluna).join(', ')} apresentam comportamento estável e equilibrado.`);
        }
        if (concentrated.length > 0) {
            insights.push(`As colunas ${concentrated.map(s => s.coluna).join(', ')} concentram-se em alguns dígitos específicos.`);
        }
        
        const numsAcima = {};
        for (let num = 0; num <= 9; num++) {
            numsAcima[num] = columnStats.filter(s => {
                const pct = (s.frequencia[num] / s.total) * 100;
                return pct > 12;
            }).length;
        }
        const numsAcimaList = Object.entries(numsAcima).filter(([_, count]) => count >= 4).map(([num]) => num);
        if (numsAcimaList.length > 0) {
            insights.push(`Os números ${numsAcimaList.join(', ')} aparecem acima da média em ${numsAcimaList.length} colunas.`);
        }
        
        const numsAbaixo = {};
        for (let num = 0; num <= 9; num++) {
            numsAbaixo[num] = columnStats.filter(s => {
                const pct = (s.frequencia[num] / s.total) * 100;
                return pct < 8;
            }).length;
        }
        const numsAbaixoList = Object.entries(numsAbaixo).filter(([_, count]) => count >= 4).map(([num]) => num);
        if (numsAbaixoList.length > 0) {
            insights.push(`Os números ${numsAbaixoList.join(', ')} estão abaixo da média em ${numsAbaixoList.length} colunas.`);
        }
        
        columnStats.forEach(s => {
            if (s.tendenciaSubindo.length > 0) {
                insights.push(`Coluna ${s.coluna}: tendência de alta para ${s.tendenciaSubindo.join(', ')}.`);
            }
        });
        
        const topInsights = insights.slice(0, 6);
        
        resumoIA = `
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; margin-top: 20px;">
                <h4 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px;">🤖 Resumo Inteligente</h4>
                <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
                    ${topInsights.map(insight => `<li>${insight}</li>`).join('')}
                    <li>📊 Baseado em ${totalDraws} concursos analisados</li>
                    <li>📅 Período: ${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</li>
                </ul>
            </div>
        `;
    } catch (e) {
        console.warn('⚠️ Erro ao gerar resumo IA:', e);
        resumoIA = `
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; margin-top: 20px;">
                <h4 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px;">🤖 Resumo Inteligente</h4>
                <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
                    <li>📊 Baseado em ${totalDraws} concursos analisados</li>
                    <li>📅 Período: ${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</li>
                    <li>🔍 Análise disponível após carregamento completo dos dados</li>
                </ul>
            </div>
        `;
    }
    
    // ============================================
    // HTML FINAL
    // ============================================
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">Total de concursos</div>
                <div style="color: #38bdf8; font-size: 20px; font-weight: bold;">${totalDraws}</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Período</div>
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</div>
            </div>
            ${dataInicio ? `
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Data inicial</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: bold;">${dataInicio}</div>
            </div>
            ` : ''}
            ${dataFim ? `
            <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
                <div style="color: #94a3b8; font-size: 11px;">📅 Data final</div>
                <div style="color: #e2e8f0; font-size: 14px; font-weight: bold;">${dataFim}</div>
            </div>
            ` : ''}
        </div>
        
        ${heatmapHtml}
        ${tabelaHtml}
        
        <div style="margin-top: 20px;">
            <h4 style="color: #f59e0b; font-size: 16px; margin-bottom: 15px;">🏆 Ranking por Coluna</h4>
            ${rankingHtml}
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="color: #f59e0b; font-size: 16px; margin-bottom: 15px;">📊 Análise por Coluna</h4>
            ${colunasHtml}
        </div>
        
        ${resumoIA}
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 7 colunas com números de 0 a 9
            </div>
        </div>
    `;
}

window.renderizarSuperSete = renderizarSuperSete;
console.log('✅ renderizarSuperSete carregada com sucesso!');
