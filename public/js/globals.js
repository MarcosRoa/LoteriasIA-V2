// js/globals.js - VERSÃO 3.0 (appState centralizado)
// ============================================

// ============================================
// ESTADO CENTRALIZADO
// ============================================
if (!window.appState) {
    window.appState = {
        usuario: null,
        isPro: false,
        creditos: 0,
        proDaysLeft: 0,
        proExpiresAt: null,
        iaSelecionada: 'hybrid',
        loteria: 'megasena',
        periodo: 'all',
        dispersao: 15
    };
}

// ============================================
// VARIÁVEIS DE COMPATIBILIDADE (APENAS REFERÊNCIAS)
// ============================================
// ✅ USAR Object.defineProperty para manter sincronia
Object.defineProperty(window, 'usuarioAtual', {
    get: () => window.appState.usuario,
    set: (v) => { window.appState.usuario = v; }
});

Object.defineProperty(window, 'creditosUsuario', {
    get: () => window.appState.creditos,
    set: (v) => { window.appState.creditos = v; }
});

Object.defineProperty(window, 'isUserPro', {
    get: () => window.appState.isPro,
    set: (v) => { window.appState.isPro = v; }
});

Object.defineProperty(window, 'proDiasRestantes', {
    get: () => window.appState.proDaysLeft,
    set: (v) => { window.appState.proDaysLeft = v; }
});

Object.defineProperty(window, 'proExpiresAt', {
    get: () => window.appState.proExpiresAt,
    set: (v) => { window.appState.proExpiresAt = v; }
});

// ============================================
// VARIÁVEIS SIMPLES
// ============================================
let processandoLogin = false;
let initExecuted = false;

window.processandoLogin = processandoLogin;
window.initExecuted = initExecuted;

// ============================================
// VERSÃO
// ============================================
const VERSAO = "7.0.0";
window.VERSAO = VERSAO;

console.log(`🚀 Loterias ${VERSAO} - V3.0 (appState centralizado)`);
