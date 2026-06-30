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
                        <tbody
