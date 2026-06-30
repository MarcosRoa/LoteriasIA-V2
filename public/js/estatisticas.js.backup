// ============================================
// FUNÇÕES DE CÁLCULO (COMPARTILHADAS)
// ============================================

function calcularFrequenciaNumeros(dados, maxNumero, incluirZero = false) {
    const limite = maxNumero + (incluirZero ? 1 : 0);
    const freq = new Array(limite).fill(0);
    
    dados.forEach(jogo => {
        jogo.forEach(numero => {
            if (numero >= 0 && numero < limite) {
                freq[numero]++;
            }
        });
    });
    
    const resultados = [];
    for (let i = 0; i < limite; i++) {
        if (incluirZero || i > 0) {
            resultados.push({ numero: i, quantidade: freq[i] });
        }
    }
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularDuplasMaisSorteadas(dados, maxNumero, incluirZero = false) {
    const duplas = new Map();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                const num1 = Math.min(jogo[i], jogo[j]);
                const num2 = Math.max(jogo[i], jogo[j]);
                const key = `${num1},${num2}`;
                duplas.set(key, (duplas.get(key) || 0) + 1);
            }
        }
    });
    
    const resultados = Array.from(duplas.entries()).map(([key, quantidade]) => {
        const [num1, num2] = key.split(',').map(Number);
        return { dupla: [num1, num2], quantidade };
    });
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularTriplasMaisSorteadas(dados, maxNumero, incluirZero = false) {
    const triplas = new Map();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                for (let k = j + 1; k < jogo.length; k++) {
                    const nums = [jogo[i], jogo[j], jogo[k]].sort((a, b) => a - b);
                    const key = `${nums[0]},${nums[1]},${nums[2]}`;
                    triplas.set(key, (triplas.get(key) || 0) + 1);
                }
            }
        }
    });
    
    const resultados = Array.from(triplas.entries()).map(([key, quantidade]) => {
        const [num1, num2, num3] = key.split(',').map(Number);
        return { tripla: [num1, num2, num3], quantidade };
    });
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

// ============================================
// RENDERIZAÇÃO ESTATÍSTICAS GERAIS
// ============================================

async function renderizarEstatisticas(loteriaId, dados) {
    const container = document.getElementById('estatisticasContainer');
    const config = window.LOTERIAS ? window.LOTERIAS[loteriaId] : { maxNumero: 60, numeros: 6, incluirZero: false };
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="stats-error">⚠️ Nenhum dado disponível para esta loteria. Faça upload do CSV.</div>';
        return;
    }
    
    const frequenciaNumeros = calcularFrequenciaNumeros(dados, config.maxNumero, config.incluirZero || false);
    const numerosMaisSorteados = frequenciaNumeros.slice(0, 20);
    const numerosMenosSorteados = [...frequenciaNumeros].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
    const duplasMaisSorteadas = calcularDuplasMaisSorteadas(dados, config.maxNumero, config.incluirZero || false).slice(0, 20);
    const triplasMaisSorteadas = calcularTriplasMaisSorteadas(dados, config.maxNumero, config.incluirZero || false).slice(0, 20);
    
    const formatarNumero = (num, incluirZero) => {
        if (num === 0 && incluirZero) return '00';
        return String(num).padStart(2, '0');
    };
    
    const formatarDupla = (dupla, incluirZero) => {
        return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
    };
    
    const formatarTripla = (tripla, incluirZero) => {
        return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
    };
    
    const incluirZero = config.incluirZero || false;
    
    const html = `
        <div class="stats-grid-cards">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS</h4>
                <div class="stats-numbers-list">
                    ${numerosMaisSorteados.map(item => `
                        <div class="stats-number-item">
                            <span class="numero">${formatarNumero(item.numero, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS</h4>
                <div class="stats-numbers-list">
                    ${numerosMenosSorteados.map(item => `
                        <div class="stats-number-item">
                            <span class="numero">${formatarNumero(item.numero, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-numbers-list">
                    ${duplasMaisSorteadas.map(item => `
                        <div class="stats-pair-item">
                            <span class="pair">${formatarDupla(item.dupla, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-numbers-list">
                    ${triplasMaisSorteadas.map(item => `
                        <div class="stats-trio-item">
                            <span class="trio">${formatarTripla(item.tripla, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${dados.length}</strong> concursos | 
                🎯 ${config.numeros || 6} números por concurso | 
                ${config.incluirZero ? '✅ Inclui zero' : '❌ Não inclui zero'}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// RENDERIZADOR SUPER SETE - COMPLETO
// ============================================

function renderizarSuperSete(data, config, userData, periodoSelecionado) {
    console.log('🔍 renderizarSuperSete chamada com data:', data);
    
    if (!data || !data.columns || data.columns.length === 0) {
        return `
            <div class="error-stats">
                ⚠️ Nenhum dado disponível para Super Sete no período selecionado.
                <br><br>
                <button onclick="window.carregarEstatisticas()" style="background: #8b5cf6; border: none; padding: 8px 20px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">
                    🔄 Tentar novamente
                </button>
            </div>
        `;
    }
    
    const columns = data.columns || [];
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    
    const columnStats = columns.map((col, index) => {
        const freq = new Array(10).fill(0);
        col.forEach(num => {
            if (num >= 0 && num <= 9) freq[num]++;
        });
        
        const ranking = freq.map((qtd, num) => ({ numero: num, quantidade: qtd }))
            .sort((a, b) => b.quantidade - a.quantidade);
        
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
            total: col.length,
            cor: cores[index % cores.length],
            quentes: quentes,
            frios: frios,
            maxFreq: Math.max(...freq),
            tendenciaSubindo: rankingUltimos.slice(0, 3).map(item => item.numero)
        };
    });
    
    // Heatmap
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
    
    // Tabela Resumo
    let tabelaHtml = `
        <div style="overflow-x: auto; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 700px;">
                <thead>
                    <tr style="background: #334155;">
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">Coluna</th>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">🔥 Quentes</th>
                        <th style="padding: 6px; text-align: center; color: #94a3b8;">❄️ Frios</th>
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
                <td style="padding: 6px 8px; text-align: center; color: #22c55e; font-weight: 600; font-size: 11px;">
                    ${tendenciaTexto || '—'}
                </td>
            </tr>
        `;
    });
    
    tabelaHtml += `</tbody></table></div>`;
    
    // Ranking por Coluna
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
            const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
            
            rankingHtml += `
                <div style="background: #0f172a; border-radius: 6px; padding: 4px 8px; text-align: center; border: 1px solid ${stat.cor}20;">
                    <div style="font-size: 10px; color: #94a3b8;">${medalha}</div>
                    <div style="font-size: 18px; font-weight: bold; color: ${stat.cor};">${item.numero}</div>
                    <div style="font-size: 10px; color: #94a3b8;">
                        ${pctReal.toFixed(1)}%
                    </div>
                </div>
            `;
        });
        
        rankingHtml += `
                </div>
            </div>
        `;
    });
    
    // Análise por Coluna
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
                    <div style="flex: 1; height: 18px; background: #0f172a; border-radius: 4px; overflow: hidden; position: relative;">
                        <div style="height: 100%; width: ${Math.max(pct, 2)}%; background: ${corBarra}; border-radius: 4px; min-width: 2px; transition: width 0.3s;"></div>
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
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 7 colunas com números de 0 a 9
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZADOR +MILIONÁRIA - TELA ESPECIAL (TUDO DO CSV)
// ============================================

function renderizarMilionaria(data, config, userData, periodoSelecionado) {
    console.log('💎 renderizarMilionaria chamada com data:', data);
    
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const trevos = data.trevos || { frequencia: [], pares: [], matriz: [], atraso: [], ranking: [], resumoIA: [] };
    
    // Dezenas
    const maisSorteados = data.maisSorteados || [];
    const menosSorteados = data.menosSorteados || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    
    const formatarNumero = (num, incluirZero) => {
        if (!userData.isPro) return '<span class="numero-pro" title="🔒 Disponível no Plano PRO">⭐⭐ PRO ⭐⭐</span>';
        if (num === 0 && incluirZero) return '00';
        return String(num).padStart(2, '0');
    };
    
    const formatarDupla = (dupla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐)';
        return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
    };
    
    const formatarTripla = (tripla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐, ⭐⭐)';
        return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
    };
    
    const proWarning = !userData.isPro ? `
        <div class="pro-overlay" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; margin-bottom: 20px;">
            <span class="pro-badge-stats">⭐ PLANO PRO ⭐</span>
            <p style="margin-top: 10px; font-size: 13px;">Faça login com uma conta PRO para visualizar todos os números e estatísticas completas!</p>
            <button onclick="window.location.href='index.html'" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 8px 20px; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer; margin-top: 10px;">⭐ IR PARA O SISTEMA</button>
        </div>
    ` : '';
    
    // Dezenas
    let dezenasHtml = `
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS (Top 20)</h4>
                <div class="stats-list">
                    ${maisSorteados.length > 0 ? maisSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS (Bottom 20)</h4>
                <div class="stats-list">
                    ${menosSorteados.length > 0 ? menosSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${duplas.length > 0 ? duplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarDupla(item.dupla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma dupla encontrada
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${triplas.length > 0 ? triplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarTripla(item.tripla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma tríade encontrada
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // Trevos - Tabela
    let trevosTabelaHtml = '';
    const frequenciaTrevos = trevos.frequencia || [];
    if (frequenciaTrevos.length > 0) {
        const totalTrevos = frequenciaTrevos.reduce((acc, f) => acc + f.quantidade, 0);
        const atrasoTrevos = trevos.atraso || [];
        
        trevosTabelaHtml = `
            <div class="milionaria-trevos-card">
                <h4>🍀 TREVOS - FREQUÊNCIA E ATRASO</h4>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: #334155;">
                                <th style="padding: 8px; text-align: left; color: #94a3b8;">Trevo</th>
                                <th style="padding: 8px; text-align: center; color: #94a3b8;">Quantidade</th>
                                <th style="padding: 8px; text-align: center; color: #94a3b8;">%</th>
                                <th style="padding: 8px; text-align: center; color: #94a3b8;">Atraso</th>
                                <th style="padding: 8px; text-align: center; color: #94a3b8;">Tendência</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${frequenciaTrevos.map(f => {
                                const atraso = atrasoTrevos.find(a => a.trevo === f.trevo);
                                const pct = totalTrevos > 0 ? (f.quantidade / totalTrevos * 100) : 0;
                                const media = totalTrevos / 6;
                                const tendencia = f.quantidade > media ? '↑' : f.quantidade < media ? '↓' : '→';
                                const corTendencia = f.quantidade > media ? '#22c55e' : f.quantidade < media ? '#ef4444' : '#f59e0b';
                                
                                return `
                                    <tr style="border-bottom: 1px solid #1e293b;">
                                        <td style="padding: 6px 8px; font-weight: 600; color: #38bdf8;">Trevo ${f.trevo}</td>
                                        <td style="padding: 6px 8px; text-align: center; color: #f59e0b; font-weight: 600;">${f.quantidade}</td>
                                        <td style="padding: 6px 8px; text-align: center; color: #94a3b8;">${pct.toFixed(1)}%</td>
                                        <td style="padding: 6px 8px; text-align: center;">
                                            <span style="color: ${atraso?.concursosAtraso > 20 ? '#ef4444' : atraso?.concursosAtraso > 10 ? '#f59e0b' : '#22c55e'}; font-weight: 600;">
                                                ${atraso?.concursosAtraso || 0}
                                            </span>
                                        </td>
                                        <td style="padding: 6px 8px; text-align: center; color: ${corTendencia}; font-weight: 600; font-size: 18px;">
                                            ${tendencia}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Heatmap Trevos
    let heatmapTrevosHtml = '';
    if (frequenciaTrevos.length > 0) {
        const maxFreq = Math.max(...frequenciaTrevos.map(f => f.quantidade));
        const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899'];
        
        heatmapTrevosHtml = `
            <div class="milionaria-trevos-card">
                <h4>📊 HEATMAP DOS TREVOS</h4>
                ${frequenciaTrevos.map((f, idx) => {
                    const pct = maxFreq > 0 ? (f.quantidade / maxFreq * 100) : 0;
                    const cor = cores[idx % cores.length];
                    const barColor = pct > 80 ? '#22c55e' : pct > 60 ? '#f59e0b' : '#38bdf8';
                    return `
                        <div class="trevo-heatmap-item">
                            <span class="label" style="color: ${cor}; font-weight: 600;">Trevo ${f.trevo}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${Math.max(pct, 2)}%; background: ${barColor};"></div>
                            </div>
                            <span class="qtd">${f.quantidade}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Ranking Trevos
    let rankingTrevosHtml = '';
    const rankingTrevos = trevos.ranking || [];
    if (rankingTrevos.length > 0) {
        const medalhas = ['🥇', '🥈', '🥉', '4º', '5º', '6º'];
        
        rankingTrevosHtml = `
            <div class="milionaria-trevos-card">
                <h4>🏆 RANKING DOS TREVOS</h4>
                <div class="trevo-ranking-grid">
                    ${rankingTrevos.map((item, idx) => `
                        <div class="trevo-ranking-item">
                            <div class="medalha">${medalhas[idx] || `${idx + 1}º`}</div>
                            <div class="trevo-num">Trevo ${item.trevo}</div>
                            <div class="trevo-qtd">${item.quantidade} vezes</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Pares de Trevos
    let paresTrevosHtml = '';
    const paresTrevos = trevos.pares || [];
    if (paresTrevos.length > 0) {
        paresTrevosHtml = `
            <div class="milionaria-trevos-card">
                <h4>🍀🍀 PARES DE TREVOS MAIS RECORRENTES</h4>
                <div class="trevo-pares-grid">
                    ${paresTrevos.slice(0, 10).map(item => `
                        <div class="trevo-par-item">
                            <span class="par">${item.par[0]}-${item.par[1]}</span>
                            <span class="qtd">${item.quantidade} vezes</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Matriz Trevos
    let matrizTrevosHtml = '';
    const matriz = trevos.matriz || [];
    if (matriz.length > 0) {
        const maxMatriz = Math.max(...matriz.flat().filter(v => v !== null));
        
        matrizTrevosHtml = `
            <div class="milionaria-trevos-card">
                <h4>📊 MATRIZ DE FREQUÊNCIA DOS TREVOS</h4>
                <div class="trevo-matriz">
                    <div class="header"></div>
                    ${[1,2,3,4,5,6].map(n => `<div class="header" style="color: #38bdf8;">${n}</div>`).join('')}
                    ${matriz.map((row, i) => `
                        ${[1,2,3,4,5,6].map((_, j) => {
                            if (i === j) {
                                return `<div class="header" style="color: #38bdf8;">${i + 1}</div><div class="cell diagonal">-</div>`;
                            }
                            const valor = row[j];
                            let classe = 'cell';
                            if (valor !== null) {
                                const pct = maxMatriz > 0 ? (valor / maxMatriz * 100) : 0;
                                if (pct > 70) classe += ' destaque-alta';
                                else if (pct > 40) classe += ' destaque';
                            }
                            return `<div class="${classe}">${valor !== null ? valor : '-'}</div>`;
                        }).join('')
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Mapa de Atraso
    let atrasoTrevosHtml = '';
    const atrasoTrevosData = trevos.atraso || [];
    if (atrasoTrevosData.length > 0) {
        atrasoTrevosHtml = `
            <div class="milionaria-trevos-card">
                <h4>⏳ MAPA DE ATRASO DOS TREVOS</h4>
                ${atrasoTrevosData.map(item => `
                    <div class="trevo-atraso-item">
                        <span class="trevo">Trevo ${item.trevo}</span>
                        <span class="atraso">${item.concursosAtraso} concursos</span>
                        <span class="status">${item.status}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Resumo IA
    let resumoIAHtml = '';
    const resumoIA = trevos.resumoIA || [];
    if (resumoIA.length > 0) {
        resumoIAHtml = `
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; margin-top: 20px;">
                <h4 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px;">🤖 Resumo Inteligente</h4>
                <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
                    ${resumoIA.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    return `
        ${proWarning}
        
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
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</div>
            </div>
        </div>
        
        ${dezenasHtml}
        
        <div style="margin-top: 30px;">
            <h3 style="color: #f59e0b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
                🍀 TREVOS - ESTATÍSTICAS EXCLUSIVAS
            </h3>
            
            <div class="milionaria-trevos-grid">
                ${trevosTabelaHtml}
                ${heatmapTrevosHtml}
                ${rankingTrevosHtml}
                ${paresTrevosHtml}
                ${matrizTrevosHtml}
                ${atrasoTrevosHtml}
            </div>
            
            ${resumoIAHtml}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 ${config.numerosCSV} números + 2 trevos por concurso
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZADOR TIMEMANIA - TELA ESPECIAL (TUDO DO CSV)
// ============================================

function renderizarTimemania(data, config, userData, periodoSelecionado) {
    console.log('⚽ renderizarTimemania chamada com data:', data);
    
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const timemania = data.timemania || {};
    const times = timemania.times || {};
    
    // Dezenas
    const maisSorteados = data.maisSorteados || [];
    const menosSorteados = data.menosSorteados || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    
    const formatarNumero = (num, incluirZero) => {
        if (!userData.isPro) return '<span class="numero-pro" title="🔒 Disponível no Plano PRO">⭐⭐ PRO ⭐⭐</span>';
        if (num === 0 && incluirZero) return '00';
        return String(num).padStart(2, '0');
    };
    
    const formatarDupla = (dupla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐)';
        return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
    };
    
    const formatarTripla = (tripla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐, ⭐⭐)';
        return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
    };
    
    const proWarning = !userData.isPro ? `
        <div class="pro-overlay" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; margin-bottom: 20px;">
            <span class="pro-badge-stats">⭐ PLANO PRO ⭐</span>
            <p style="margin-top: 10px; font-size: 13px;">Faça login com uma conta PRO para visualizar todos os números e estatísticas completas!</p>
            <button onclick="window.location.href='index.html'" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 8px 20px; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer; margin-top: 10px;">⭐ IR PARA O SISTEMA</button>
        </div>
    ` : '';
    
    // Dezenas
    let dezenasHtml = `
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS (Top 20)</h4>
                <div class="stats-list">
                    ${maisSorteados.length > 0 ? maisSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS (Bottom 20)</h4>
                <div class="stats-list">
                    ${menosSorteados.length > 0 ? menosSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${duplas.length > 0 ? duplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarDupla(item.dupla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma dupla encontrada
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${triplas.length > 0 ? triplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarTripla(item.tripla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma tríade encontrada
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // Distribuição por dezenas
    let distribuicaoHtml = '';
    const distribuicaoDezenas = timemania.distribuicaoDezenas || [];
    if (distribuicaoDezenas.length > 0) {
        const maxDist = Math.max(...distribuicaoDezenas.map(d => d.quantidade));
        
        distribuicaoHtml = `
            <div class="milionaria-trevos-card">
                <h4>🎯 DISTRIBUIÇÃO POR DEZENAS</h4>
                ${distribuicaoDezenas.map(item => {
                    const pct = maxDist > 0 ? (item.quantidade / maxDist * 100) : 0;
                    const cor = pct > 80 ? '#22c55e' : pct > 60 ? '#f59e0b' : '#38bdf8';
                    return `
                        <div class="trevo-heatmap-item">
                            <span class="label" style="width: 60px; color: #94a3b8;">${item.label}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${Math.max(pct, 2)}%; background: ${cor};"></div>
                            </div>
                            <span class="qtd">${item.quantidade}</span>
                            <span style="font-size: 10px; color: #94a3b8; width: 40px;">${item.percentual.toFixed(1)}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Pares × Ímpares
    let paresImparesHtml = '';
    const paresImpares = timemania.paresImpares || [];
    if (paresImpares.length > 0) {
        const maxPI = Math.max(...paresImpares.map(p => p.quantidade));
        const coresPI = ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444'];
        
        paresImparesHtml = `
            <div class="milionaria-trevos-card">
                <h4>⚖️ PARES × ÍMPARES</h4>
                ${paresImpares.map((item, idx) => {
                    const pct = maxPI > 0 ? (item.quantidade / maxPI * 100) : 0;
                    const cor = coresPI[idx % coresPI.length];
                    return `
                        <div class="trevo-heatmap-item">
                            <span class="label" style="width: 50px; color: ${cor}; font-weight: 600;">${item.proporcao}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${Math.max(pct, 2)}%; background: ${cor};"></div>
                            </div>
                            <span class="qtd">${item.quantidade}</span>
                            <span style="font-size: 10px; color: #94a3b8; width: 40px;">${item.percentual.toFixed(1)}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Ranking dos Times
    let rankingHtml = '';
    const rankingTimes = times.ranking || [];
    if (rankingTimes.length > 0) {
        const medalhas = ['🥇', '🥈', '🥉', '4º', '5º', '6º', '7º', '8º', '9º', '10º'];
        rankingHtml = `
            <div class="milionaria-trevos-card">
                <h4>🏆 RANKING DOS TIMES DO CORAÇÃO</h4>
                <div class="trevo-ranking-grid">
                    ${rankingTimes.slice(0, 10).map((item, idx) => `
                        <div class="trevo-ranking-item">
                            <div class="medalha">${medalhas[idx] || `${idx + 1}º`}</div>
                            <div class="trevo-num" style="color: #f59e0b; font-size: 14px;">${item.time}</div>
                            <div class="trevo-qtd">${item.quantidade} vezes</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Frequência dos Times
    let frequenciaHtml = '';
    const frequenciaTimes = times.frequencia || [];
    if (frequenciaTimes.length > 0) {
        const maxFreq = Math.max(...frequenciaTimes.map(f => f.quantidade));
        const coresTimes = ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#f43f5e'];
        
        frequenciaHtml = `
            <div class="milionaria-trevos-card">
                <h4>📊 FREQUÊNCIA DOS TIMES</h4>
                ${frequenciaTimes.slice(0, 10).map((item, idx) => {
                    const pct = maxFreq > 0 ? (item.quantidade / maxFreq * 100) : 0;
                    const cor = coresTimes[idx % coresTimes.length];
                    return `
                        <div class="trevo-heatmap-item">
                            <span class="label" style="color: ${cor}; font-weight: 600; width: 120px;">${item.time}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${Math.max(pct, 2)}%; background: ${cor};"></div>
                            </div>
                            <span class="qtd">${item.quantidade}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Times por Estado
    let estadosHtml = '';
    const timesPorEstado = times.porEstado || [];
    if (timesPorEstado.length > 0) {
        const maxEstado = Math.max(...timesPorEstado.map(e => e.quantidade));
        const coresEstado = ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];
        
        estadosHtml = `
            <div class="milionaria-trevos-card">
                <h4>📍 TIMES POR ESTADO</h4>
                ${timesPorEstado.map((item, idx) => {
                    const pct = maxEstado > 0 ? (item.quantidade / maxEstado * 100) : 0;
                    const cor = coresEstado[idx % coresEstado.length];
                    return `
                        <div class="trevo-heatmap-item">
                            <span class="label" style="color: ${cor}; font-weight: 600; width: 50px;">${item.estado}</span>
                            <div class="bar">
                                <div class="fill" style="width: ${Math.max(pct, 2)}%; background: ${cor};"></div>
                            </div>
                            <span class="qtd">${item.quantidade}</span>
                            <span style="font-size: 10px; color: #94a3b8; width: 40px;">${item.percentual.toFixed(1)}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Times atrasados
    let atrasoHtml = '';
    const timesAtraso = times.atraso || [];
    if (timesAtraso.length > 0) {
        atrasoHtml = `
            <div class="milionaria-trevos-card">
                <h4>⏳ TIMES MAIS ATRASADOS</h4>
                ${timesAtraso.map(item => `
                    <div class="trevo-atraso-item">
                        <span class="trevo" style="color: #f59e0b;">${item.time}</span>
                        <span class="atraso">${item.concursosAtraso} concursos</span>
                        <span class="status">${item.status}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Tendência
    let tendenciaHtml = '';
    const tendenciaTimes = times.tendencia || [];
    if (tendenciaTimes.length > 0) {
        tendenciaHtml = `
            <div class="milionaria-trevos-card">
                <h4>📈 TENDÊNCIA (Últimos 30 concursos)</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px;">
                    ${tendenciaTimes.slice(0, 8).map(item => {
                        const seta = item.quantidade > 4 ? '⬆' : item.quantidade > 2 ? '→' : '⬇';
                        return `
                            <div style="background: #0f172a; border-radius: 6px; padding: 8px 12px; text-align: center; border: 1px solid var(--border);">
                                <div style="font-size: 20px;">${seta}</div>
                                <div style="font-weight: 600; color: #f59e0b; font-size: 13px;">${item.time}</div>
                                <div style="font-size: 11px; color: #94a3b8;">${item.quantidade} ocorrências</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Resumo IA
    let resumoIAHtml = '';
    const resumoIA = timemania.resumoIA || [];
    if (resumoIA.length > 0) {
        resumoIAHtml = `
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; border-radius: 8px; padding: 16px; margin-top: 20px;">
                <h4 style="color: #8b5cf6; font-size: 14px; margin-bottom: 8px;">🤖 Resumo Inteligente</h4>
                <ul style="margin: 0; padding-left: 20px; color: #e2e8f0; font-size: 13px; line-height: 1.8;">
                    ${resumoIA.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    return `
        ${proWarning}
        
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
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</div>
            </div>
        </div>
        
        ${dezenasHtml}
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
            ${distribuicaoHtml}
            ${paresImparesHtml}
        </div>
        
        <div style="margin-top: 30px;">
            <h3 style="color: #f59e0b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
                ⚽ TIMES DO CORAÇÃO - ESTATÍSTICAS EXCLUSIVAS
            </h3>
            
            <div class="milionaria-trevos-grid">
                ${rankingHtml}
                ${frequenciaHtml}
                ${estadosHtml}
                ${atrasoHtml}
                ${tendenciaHtml}
            </div>
            
            ${resumoIAHtml}
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 ${config.numerosCSV} números + 1 Time do Coração por concurso
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZADOR DIA DE SORTE - COM MÊS (TUDO DO CSV)
// ============================================

function renderizarDiaDeSorte(data, config, userData, periodoSelecionado) {
    console.log('📅 renderizarDiaDeSorte chamada com data:', data);
    
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const elementosExtras = data.elementosExtras || [];
    const nomeElemento = data.nomeElemento || 'Mês de Sorte';
    
    // Dezenas
    const maisSorteados = data.maisSorteados || [];
    const menosSorteados = data.menosSorteados || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    
    const formatarNumero = (num, incluirZero) => {
        if (!userData.isPro) return '<span class="numero-pro" title="🔒 Disponível no Plano PRO">⭐⭐ PRO ⭐⭐</span>';
        if (num === 0 && incluirZero) return '00';
        return String(num).padStart(2, '0');
    };
    
    const formatarDupla = (dupla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐)';
        return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
    };
    
    const formatarTripla = (tripla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐, ⭐⭐)';
        return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
    };
    
    const proWarning = !userData.isPro ? `
        <div class="pro-overlay" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; margin-bottom: 20px;">
            <span class="pro-badge-stats">⭐ PLANO PRO ⭐</span>
            <p style="margin-top: 10px; font-size: 13px;">Faça login com uma conta PRO para visualizar todos os números e estatísticas completas!</p>
            <button onclick="window.location.href='index.html'" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 8px 20px; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer; margin-top: 10px;">⭐ IR PARA O SISTEMA</button>
        </div>
    ` : '';
    
    // Dezenas
    let dezenasHtml = `
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS (Top 20)</h4>
                <div class="stats-list">
                    ${maisSorteados.length > 0 ? maisSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS (Bottom 20)</h4>
                <div class="stats-list">
                    ${menosSorteados.length > 0 ? menosSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${duplas.length > 0 ? duplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarDupla(item.dupla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma dupla encontrada
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${triplas.length > 0 ? triplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarTripla(item.tripla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma tríade encontrada
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // Meses extras
    let mesesHtml = '';
    if (elementosExtras.length > 0) {
        mesesHtml = `
            <div class="milionaria-trevos-card">
                <h4>📅 ${nomeElemento}s MAIS SORTEADOS</h4>
                <div class="stats-list">
                    ${elementosExtras.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${userData.isPro ? item.nome : '⭐⭐ PRO ⭐⭐'}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    return `
        ${proWarning}
        
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
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</div>
            </div>
        </div>
        
        ${dezenasHtml}
        
        <div style="margin-top: 20px;">
            <div class="milionaria-trevos-grid">
                ${mesesHtml}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 ${config.numerosCSV} números + 1 ${nomeElemento} por concurso
            </div>
        </div>
    `;
}

// ============================================
// RENDERIZADOR LOTECA
// ============================================

function renderizarLoteca(data, config, userData, periodoSelecionado) {
    console.log('⚽ renderizarLoteca chamada com data:', data);
    
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const loteca = data.loteca || {};
    const { frequenciaGlobal, frequenciaPorJogo } = loteca;
    
    const proWarning = !userData.isPro ? `
        <div class="pro-overlay" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; margin-bottom: 20px;">
            <span class="pro-badge-stats">⭐ PLANO PRO ⭐</span>
            <p style="margin-top: 10px; font-size: 13px;">Faça login com uma conta PRO para visualizar todos os números e estatísticas completas!</p>
            <button onclick="window.location.href='index.html'" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 8px 20px; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer; margin-top: 10px;">⭐ IR PARA O SISTEMA</button>
        </div>
    ` : '';
    
    let html = `
        ${proWarning}
        
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
                <div style="color: #f59e0b; font-size: 14px; font-weight: bold;">${periodoSelecionado === 'all' ? 'Todos' : `${periodoSelecionado} anos`}</div>
            </div>
        </div>
        
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>📊 FREQUÊNCIA GLOBAL</h4>
                <div class="stats-list">
                    ${frequenciaGlobal ? frequenciaGlobal.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${userData.isPro ? item.resultado : '⭐⭐ PRO ⭐⭐'}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <h4 style="color: var(--text-secondary); margin-bottom: 15px;">📊 FREQUÊNCIA POR JOGO</h4>
            <div class="loteca-stats-grid">
                ${frequenciaPorJogo ? frequenciaPorJogo.map(jogo => `
                    <div class="loteca-jogo-card">
                        <h5>⚽ Jogo ${jogo.jogo}</h5>
                        <div class="loteca-bar">
                            <div class="casa" style="width: ${(jogo.casa / jogo.total * 100) || 0}%;"></div>
                            <div class="empate" style="width: ${(jogo.empate / jogo.total * 100) || 0}%;"></div>
                            <div class="fora" style="width: ${(jogo.fora / jogo.total * 100) || 0}%;"></div>
                        </div>
                        <div class="loteca-legend">
                            <span>🏠 Casa: ${jogo.casa}</span>
                            <span>🤝 Empate: ${jogo.empate}</span>
                            <span>✈️ Fora: ${jogo.fora}</span>
                            <span>📊 Total: ${jogo.total}</span>
                        </div>
                    </div>
                `).join('') : ''}
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 ${config.numerosCSV} jogos por concurso
            </div>
        </div>
    `;
    
    return html;
}

// ============================================
// RENDERIZADOR ESTATÍSTICAS LOCAIS (FALLBACK)
// ============================================

async function renderizarEstatisticasLocal(data) {
    const container = document.getElementById('estatisticasContent');
    const config = window.LOTERIAS ? window.LOTERIAS[loteriaAtualStats] : { maxNumero: 60, numeros: 6, incluirZero: false };
    
    // Se for uma loteria especial, usa o renderizador específico
    if (data.isTimemania) {
        const html = renderizarTimemania(data, config, userData, periodoSelecionadoStats);
        container.innerHTML = html;
        return;
    }
    
    if (data.isMilionaria) {
        const html = renderizarMilionaria(data, config, userData, periodoSelecionadoStats);
        container.innerHTML = html;
        return;
    }
    
    if (data.isDiaDeSorte) {
        const html = renderizarDiaDeSorte(data, config, userData, periodoSelecionadoStats);
        container.innerHTML = html;
        return;
    }
    
    if (data.loteca) {
        const html = renderizarLoteca(data, config, userData, periodoSelecionadoStats);
        container.innerHTML = html;
        return;
    }
    
    // Fallback para outras loterias
    const maisSorteados = data.maisSorteados || [];
    const menosSorteados = data.menosSorteados || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    
    const formatarNumero = (num, incluirZero) => {
        if (!userData.isPro) return '<span class="numero-pro" title="🔒 Disponível no Plano PRO">⭐⭐ PRO ⭐⭐</span>';
        if (num === 0 && incluirZero) return '00';
        return String(num).padStart(2, '0');
    };
    
    const formatarDupla = (dupla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐)';
        return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
    };
    
    const formatarTripla = (tripla, incluirZero) => {
        if (!userData.isPro) return '(⭐⭐, ⭐⭐, ⭐⭐)';
        return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
    };
    
    const proWarning = !userData.isPro ? `
        <div class="pro-overlay" style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; margin-bottom: 20px;">
            <span class="pro-badge-stats">⭐ PLANO PRO ⭐</span>
            <p style="margin-top: 10px; font-size: 13px;">Faça login com uma conta PRO para visualizar todos os números e estatísticas completas!</p>
            <button onclick="window.location.href='index.html'" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 8px 20px; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer; margin-top: 10px;">⭐ IR PARA O SISTEMA</button>
        </div>
    ` : '';
    
    const html = `
        ${proWarning}
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS (Top 20)</h4>
                <div class="stats-list">
                    ${maisSorteados.length > 0 ? maisSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS (Bottom 20)</h4>
                <div class="stats-list">
                    ${menosSorteados.length > 0 ? menosSorteados.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarNumero(item.numero, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${duplas.length > 0 ? duplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarDupla(item.dupla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma dupla encontrada
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${triplas.length > 0 ? triplas.map(item => `
                        <div class="stats-item">
                            <span class="${userData.isPro ? 'numero' : 'numero-pro'}">${formatarTripla(item.tripla, config.incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma tríade encontrada
                        </div>
                    `}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${data.filteredDraws || data.totalDraws || 0}</strong> concursos | 
                🎯 ${config.numerosCSV} números por concurso
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// EXPORTAÇÃO
// ============================================
window.renderizarEstatisticas = renderizarEstatisticas;
window.renderizarSuperSete = renderizarSuperSete;
window.renderizarMilionaria = renderizarMilionaria;
window.renderizarTimemania = renderizarTimemania;
window.renderizarDiaDeSorte = renderizarDiaDeSorte;
window.renderizarLoteca = renderizarLoteca;
window.renderizarEstatisticasLocal = renderizarEstatisticasLocal;
window.calcularFrequenciaNumeros = calcularFrequenciaNumeros;
window.calcularDuplasMaisSorteadas = calcularDuplasMaisSorteadas;
window.calcularTriplasMaisSorteadas = calcularTriplasMaisSorteadas;
window.renderizarEstatisticasLocal = renderizarEstatisticasLocal;

console.log('✅ estatisticas.js carregado com sucesso!');
console.log('🔍 renderizarSuperSete disponível:', typeof renderizarSuperSete);
console.log('💎 renderizarMilionaria disponível:', typeof renderizarMilionaria);
console.log('⚽ renderizarTimemania disponível:', typeof renderizarTimemania);
console.log('📅 renderizarDiaDeSorte disponível:', typeof renderizarDiaDeSorte);
