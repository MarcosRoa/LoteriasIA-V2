//public/js/estatisticas/core/utils.js
// ============================================
// UTILITÁRIOS COMPARTILHADOS  01/07/2026
// ============================================

// ============================================
// UTILITÁRIOS - FUNÇÕES DE FORMATAÇÃO PURA
// ============================================

/**
 * Formata número com zero à esquerda
 */
export function formatarNumero(num, incluirZero = false) {
    if (num === 0 && incluirZero) return '00';
    return String(num).padStart(2, '0');
}

/**
 * Formata dupla para exibição
 */
export function formatarDupla(dupla, incluirZero = false) {
    return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
}

/**
 * Formata tripla para exibição
 */
export function formatarTripla(tripla, incluirZero = false) {
    return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
}

/**
 * Formata percentual
 */
export function formatarPercentual(valor) {
    return valor.toFixed(1) + '%';
}

/**
 * Formata quantidade com plural
 */
export function formatarQuantidade(valor, singular = 'vez', plural = 'vezes') {
    return `${valor} ${valor === 1 ? singular : plural}`;
}

/**
 * Formata data
 */
export function formatarData(data) {
    if (!data) return 'N/A';
    return data;
}

/**
 * Formata período para exibição
 */
export function formatarPeriodo(periodo) {
    return periodo === 'all' ? 'Todos' : `${periodo} anos`;
}

/**
 * Extrai o nome sem estado (ex: PALMEIRAS/SP → PALMEIRAS)
 */
export function extrairNomeSemEstado(nome) {
    if (!nome) return '';
    const partes = nome.split('/');
    return partes[0];
}
