//public/js/estatisticas/loterias/timemania.js

// ============================================
// TIMEMANIA - COM TIME DO CORAÇÃO
// ============================================

import { 
    calcularFrequenciaNumeros,
    calcularDuplasMaisSorteadas,
    calcularTriplasMaisSorteadas,
    calcularDistribuicaoDezenas,
    calcularParesImpares,
    extrairUF
} from '../core/calculos.js';

import {
    formatarNumero,
    formatarDupla,
    formatarTripla,
    criarItemStats,
    criarProBanner,
    criarResumo,
    criarFooter,
    renderizarElementosExtras
} from '../core/utils.js';

import { renderizarBase } from '../renderers/base.js';

/**
 * Renderiza Timemania com estatísticas de times
 */
export function renderizar(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const isPro = userData.isPro || false;
    const timemania = data.timemania || {};
    const times = timemania.times || {};
    
    // Dezenas (usando base)
    const baseHtml = renderizarBase(data, config, userData, periodo);
    
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
        const cores = ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];
        frequenciaHtml = `
            <div class="milionaria-trevos-card">
                <h4>📊 FREQUÊNCIA DOS TIMES</h4>
                ${frequenciaTimes.slice(0, 10).map((item, idx) => {
                    const pct = maxFreq > 0 ? (item.quantidade / maxFreq * 100) : 0;
                    const cor = cores[idx % cores.length];
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
        const cores = ['#38bdf8', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];
        estadosHtml = `
            <div class="milionaria-trevos-card">
                <h4>📍 TIMES POR ESTADO</h4>
                ${timesPorEstado.map((item, idx) => {
                    const pct = maxEstado > 0 ? (item.quantidade / maxEstado * 100) : 0;
                    const cor = cores[idx % cores.length];
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
    
    // Montar HTML final
    const proBanner = !isPro ? criarProBanner() : '';
    const resumo = criarResumo(totalDraws, dataInicio, dataFim, periodo);
    const footer = criarFooter(totalDraws, config.numerosCSV, '1 Time do Coração por concurso');
    
    // Extrair a parte de cards do baseHtml (já está incluído)
    // Vamos construir o HTML completo
    const baseCardsMatch = baseHtml.match(/<div class="stats-cards-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    const baseCards = baseCardsMatch ? baseCardsMatch[0] : '';
    
    return `
        ${proBanner}
        ${resumo}
        
        <!-- Dezenas -->
        ${baseCards}
        
        <!-- Distribuição e Pares/Ímpares -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
            ${distribuicaoHtml}
            ${paresImparesHtml}
        </div>
        
        <!-- TIMES DO CORAÇÃO -->
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
        
        ${footer}
    `;
}

export default { renderizar };
