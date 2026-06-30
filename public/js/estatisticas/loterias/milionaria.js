//public/js/estatisticas/loterias/milionaria.js

// ============================================
// +MILIONÁRIA - COM TREVOS
// ============================================

import { renderizarBase } from '../renderers/base.js';
import { criarItemStats, criarProBanner, criarResumo, criarFooter } from '../core/utils.js';

/**
 * Renderiza +Milionária com estatísticas de trevos
 */
export function renderizar(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const isPro = userData.isPro || false;
    const trevos = data.trevos || { frequencia: [], pares: [], matriz: [], atraso: [], ranking: [], resumoIA: [] };
    
    // Dezenas (usando base)
    const baseHtml = renderizarBase(data, config, userData, periodo);
    
    // Tabela de Trevos
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
                    ${matriz.map((row, i) => {
                        return [1,2,3,4,5,6].map((_, j) => {
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
                        }).join('');
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
    
    // Montar HTML final
    const proBanner = !isPro ? criarProBanner() : '';
    const resumo = criarResumo(totalDraws, dataInicio, dataFim, periodo);
    const footer = criarFooter(totalDraws, config.numerosCSV, '2 trevos por concurso');
    
    const baseCardsMatch = baseHtml.match(/<div class="stats-cards-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    const baseCards = baseCardsMatch ? baseCardsMatch[0] : '';
    
    return `
        ${proBanner}
        ${resumo}
        
        <!-- Dezenas -->
        ${baseCards}
        
        <!-- TREVOS -->
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
        
        ${footer}
    `;
}

export default { renderizar };
