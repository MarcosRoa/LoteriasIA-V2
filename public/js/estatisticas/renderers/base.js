// public/js/estatisticas/renderers/base.js
// ============================================
// RENDERIZADOR BASE - PADRÃO PARA LOTERIAS 01/07/2026
// ============================================

// ============================================
// RENDERIZADOR BASE - ORQUESTRADOR
// ============================================

import { 
    calcularFrequencia,
    calcularDuplas,
    calcularTriplas,
    calcularRanking
} from '../core/calculos.js';

import { criarResumo, criarProBanner } from './components/resumo.js';
import { criarFooter } from './components/footer.js';
import { criarCards } from './components/cards.js';
import { renderizarExtras } from './components/extras.js';
import { renderizarHeatmap } from './components/heatmap.js';
import { renderizarRanking } from './components/ranking.js';
import { renderizarBarraHorizontal } from './components/barraHorizontal.js';
import { renderizarResumoIA } from './components/resumoIA.js';
import { renderizarTabela } from './components/tabela.js';

// ============================================
// BASE - RETORNA OBJETO (NÃO STRING)
// ============================================

export function renderizarBase(data, config, userData, periodo) {
    const totalDraws = data.filteredDraws || data.totalDraws || 0;
    const dataInicio = data.dataInicio || '';
    const dataFim = data.dataFim || '';
    const isPro = userData.isPro || false;
    const incluirZero = config.incluirZero || false;
    
    const maisSorteados = data.maisSorteados || [];
    const menosSorteados = data.menosSorteados || [];
    const duplas = data.duplas || [];
    const triplas = data.triplas || [];
    
    return {
        // Componentes individuais (NÃO STRING ÚNICA)
        proBanner: !isPro ? criarProBanner() : '',
        resumo: criarResumo(totalDraws, dataInicio, dataFim, periodo),
        cards: criarCards(maisSorteados, menosSorteados, duplas, triplas, isPro, incluirZero),
        footer: criarFooter(totalDraws, config.numerosCSV)
    };
}

// ============================================
// EXPORTAÇÃO DOS COMPONENTES
// ============================================

export {
    criarResumo,
    criarProBanner,
    criarFooter,
    criarCards,
    renderizarExtras,
    renderizarHeatmap,
    renderizarRanking,
    renderizarBarraHorizontal,
    renderizarResumoIA,
    renderizarTabela
};
