// ============================================
// ESTATISTICAS.js - Cálculo e exibição de estatísticas (27/06/2026)
// ============================================

// ============================================
// FUNÇÕES DE CÁLCULO
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
// FUNÇÃO PARA RENDERIZAR SUPER SETE
// ============================================
function renderizarSuperSete(data, config, userData, periodoSelecionado) {
    const container = document.getElementById('estatisticasContent');
    const columns = data.columns || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    
    if (!columns || columns.length === 0) {
        return `
            <div class="error-stats">
                ⚠️ Nenhum dado disponível para Super Sete no período selecionado.
                <br>
                <small>Tente alterar o período ou selecionar outra loteria.</small>
            </div>
        `;
    }
    
    // Cores para cada coluna
    const cores = ['#8b5cf6', '#38bdf8', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#f97316'];
    
    // Calcular estatísticas por coluna
    const columnStats = columns.map((col, index) => {
        const freq = new Array(10).fill(0);
        col.forEach(num => {
            if (num >= 0 && num <= 9) freq[num]++;
        });
        
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
        
        // Calcular média e desvio padrão
        const media = col.length / 10;
        const desvioPadrao = Math.sqrt(
            freq.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / 10
        );
        const isBalanced = desvioPadrao < media * 0.3;
        
        // Números quentes e frios por coluna
        const sorted = freq.map((qtd, num) => ({ numero: num, quantidade: qtd })).sort((a, b) => b.quantidade - a.quantidade);
        const quentes = sorted.slice(0, 3).map(item => item.numero);
        const frios = sorted.slice(-3).reverse().map(item => item.numero);
        
        return {
            coluna: index + 1,
            frequencia: freq,
            maisFrequente,
            menosFrequente,
            qtdeMais,
            qtdeMenos,
            total: col.length,
            cor: cores[index % cores.length],
            media,
            desvioPadrao,
            isBalanced,
            quentes,
            frios,
            maxFreq: Math.max(...freq)
        };
    });
    
    // Tabela resumo
    let tabelaHtml = `
        <div style="overflow-x: auto; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #334155;">
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">Coluna</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">🔥 Quentes</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">❄️ Frios</th>
                        <th style="padding: 8px; text-align: center; color: #94a3b8;">⚖️ Equilíbrio</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    columnStats.forEach(stat => {
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
            </tr>
        `;
    });
    
    tabelaHtml += `</tbody></table></div>`;
    
    // Colunas com gráficos
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
            const corBarra = pctReal >= 12 ? '#22c55e' : pctReal <= 8 ? '#ef4444' : '#f59e0b';
            const isQuente = stat.quentes.includes(i);
            const isFrio = stat.frios.includes(i);
            
            colunasHtml += `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: ${isQuente ? '#ef4444' : isFrio ? '#38bdf8' : '#e2e8f0'}; font-size: 11px; width: 20px; text-align: center; font-weight: ${isQuente || isFrio ? 'bold' : 'normal'};">${i}</span>
                    <div style="flex: 1; height: 16px; background: #0f172a; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${Math.max(pct, 2)}%; background: ${corBarra}; border-radius: 4px; min-width: 2px;"></div>
                    </div>
                    <span style="color: #94a3b8; font-size: 10px; width: 30px; text-align: right;">${freq}</span>
                    <span style="color: ${corBarra}; font-size: 10px; width: 55px; text-align: right; font-weight: 600;">
                        ${pctReal.toFixed(1)}%
                        ${Math.abs(pctReal - 10) > 1 ? (pctReal > 10 ? '▲' : '▼') : ''}
                    </span>
                </div>
            `;
        }
        
        colunasHtml += `
                </div>
            </div>
        `;
    });
    
    // Gerar resumo inteligente
    let resumoIA = '';
    try {
        const insights = [];
        columnStats.forEach(stat => {
            if (stat.quentes.length > 0) {
                insights.push(`Coluna ${stat.coluna}: predominância do(s) dígito(s) ${stat.quentes.join(', ')}`);
            }
            if (stat.isBalanced) {
                insights.push(`Coluna ${stat.coluna}: distribuição equilibrada`);
            } else {
                insights.push(`Coluna ${stat.coluna}: apresenta concentração em alguns dígitos`);
            }
        });
        
        // Selecionar os 3 insights mais relevantes
        const topInsights = insights.slice(0, 3);
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
        resumoIA = '';
    }
    
    // Montar HTML final
    return `
        <!-- Resumo -->
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
        
        <!-- Tabela Resumo -->
        ${tabelaHtml}
        
        <!-- Colunas -->
        <div style="margin-top: 20px;">
            <h4 style="color: #f59e0b; font-size: 16px; margin-bottom: 15px;">📊 Análise por Coluna</h4>
            ${colunasHtml}
        </div>
        
        <!-- Duplas -->
        <div style="margin-top: 20px; background: #1e293b; border-radius: 8px; padding: 16px;">
            <h4 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">🔗 Top 10 Duplas</h4>
            ${duplas.slice(0, 10).map((item, index) => `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #1e293b;">
                    <span style="color: #38bdf8; font-size: 13px;">${index + 1}. (${String(item.dupla[0]).padStart(2, '0')}, ${String(item.dupla[1]).padStart(2, '0')})</span>
                    <span style="color: #f59e0b; font-size: 13px; font-weight: 600;">${item.quantidade} vezes</span>
                </div>
            `).join('')}
        </div>
        
        <!-- Triplas -->
        <div style="margin-top: 12px; background: #1e293b; border-radius: 8px; padding: 16px;">
            <h4 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">🔗 Top 10 Triplas</h4>
            ${triplas.slice(0, 10).map((item, index) => `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #1e293b;">
                    <span style="color: #38bdf8; font-size: 13px;">${index + 1}. (${String(item.tripla[0]).padStart(2, '0')}, ${String(item.tripla[1]).padStart(2, '0')}, ${String(item.tripla[2]).padStart(2, '0')})</span>
                    <span style="color: #f59e0b; font-size: 13px; font-weight: 600;">${item.quantidade} vezes</span>
                </div>
            `).join('')}
        </div>
        
        <!-- Resumo IA -->
        ${resumoIA}
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${totalDraws}</strong> concursos | 
                🎯 7 colunas com números de 0 a 9
            </div>
        </div>
    `;
}

// ============================================
// FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO
// ============================================

async function renderizarEstatisticas(loteriaId, dados) {
    const container = document.getElementById('estatisticasContainer');
    const config = window.LOTERIAS[loteriaId];
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="stats-error">⚠️ Nenhum dado disponível para esta loteria. Faça upload do CSV.</div>';
        return;
    }
    
    // Calcular estatísticas
    const frequenciaNumeros = calcularFrequenciaNumeros(dados, config.maxNumero, config.incluirZero || false);
    const numerosMaisSorteados = frequenciaNumeros.slice(0, 20);
    const numerosMenosSorteados = [...frequenciaNumeros].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
    const duplasMaisSorteadas = calcularDuplasMaisSorteadas(dados, config.maxNumero, config.incluirZero || false).slice(0, 20);
    const triplasMaisSorteadas = calcularTriplasMaisSorteadas(dados, config.maxNumero, config.incluirZero || false).slice(0, 20);
    
    // Formatar número com zero à esquerda
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
            <!-- Números Mais Sorteados -->
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
            
            <!-- Números Menos Sorteados -->
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
            
            <!-- Duplas Mais Sorteadas -->
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
            
            <!-- Tríades Mais Sorteadas -->
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
                🎯 ${config.numeros} números por concurso | 
                ${config.incluirZero ? '✅ Inclui zero' : '❌ Não inclui zero'}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// EXPORTAÇÃO
// ============================================
window.renderizarEstatisticas = renderizarEstatisticas;
window.calcularFrequenciaNumeros = calcularFrequenciaNumeros;
window.calcularDuplasMaisSorteadas = calcularDuplasMaisSorteadas;
window.calcularTriplasMaisSorteadas = calcularTriplasMaisSorteadas;
window.renderizarSuperSete = renderizarSuperSete;
