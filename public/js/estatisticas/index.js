//public/js/estatisticas/index.js

// ============================================
// PONTO DE ENTRADA - ESTATÍSTICAS
// ============================================

// Importar core
import * as core from './core/calculos.js';
import * as utils from './core/utils.js';

// Importar renderers
import * as base from './renderers/base.js';
import * as components from './renderers/components.js';

// Importar todas as loterias
import * as megasena from './loterias/megasena.js';
import * as quina from './loterias/quina.js';
import * as lotofacil from './loterias/lotofacil.js';
import * as lotomania from './loterias/lotomania.js';
import * as duplasena from './loterias/duplasena.js';
import * as timemania from './loterias/timemania.js';
import * as milionaria from './loterias/milionaria.js';
import * as loteca from './loterias/loteca.js';
import * as diadesorte from './loterias/diadesorte.js';
import * as supersete from './loterias/supersete.js';

// ============================================
// MAPEAMENTO DE RENDERIZADORES
// ============================================

const RENDERIZADORES = {
    megasena: megasena.renderizar,
    quina: quina.renderizar,
    lotofacil: lotofacil.renderizar,
    lotomania: lotomania.renderizar,
    duplasena: duplasena.renderizar,
    timemania: timemania.renderizar,
    milionaria: milionaria.renderizar,
    loteca: loteca.renderizar,
    diadesorte: diadesorte.renderizar,
    supersete: supersete.renderizar
};

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Renderiza estatísticas para uma loteria específica
 */
export function renderizarEstatisticas(loteria, data, config, userData, periodo) {
    const renderizador = RENDERIZADORES[loteria];
    
    if (!renderizador) {
        console.warn(`⚠️ Renderizador não encontrado para: ${loteria}`);
        return base.renderizarBase(data, config, userData, periodo);
    }
    
    return renderizador(data, config, userData, periodo);
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================

// Funções de cálculo
window.calcularFrequenciaNumeros = core.calcularFrequenciaNumeros;
window.calcularDuplasMaisSorteadas = core.calcularDuplasMaisSorteadas;
window.calcularTriplasMaisSorteadas = core.calcularTriplasMaisSorteadas;
window.calcularElementosExtras = core.calcularElementosExtras;
window.extrairUF = core.extrairUF;
window.calcularDistribuicaoDezenas = core.calcularDistribuicaoDezenas;
window.calcularParesImpares = core.calcularParesImpares;

// Utilitários
window.formatarNumero = utils.formatarNumero;
window.formatarDupla = utils.formatarDupla;
window.formatarTripla = utils.formatarTripla;

// Renderizador principal
window.renderizarEstatisticas = renderizarEstatisticas;

// Renderizadores individuais (para fallback)
window.renderizarMegasena = megasena.renderizar;
window.renderizarQuina = quina.renderizar;
window.renderizarLotofacil = lotofacil.renderizar;
window.renderizarLotomania = lotomania.renderizar;
window.renderizarDuplaSena = duplasena.renderizar;
window.renderizarTimemania = timemania.renderizar;
window.renderizarMilionaria = milionaria.renderizar;
window.renderizarLoteca = loteca.renderizar;
window.renderizarDiaDeSorte = diadesorte.renderizar;
window.renderizarSuperSete = supersete.renderizar;

// Função de fallback
window.renderizarBase = base.renderizarBase;

console.log('✅ Estatísticas carregadas com sucesso!');
console.log('📊 Loterias disponíveis:', Object.keys(RENDERIZADORES));
