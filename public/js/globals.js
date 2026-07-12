// js/globals.js - Variáveis globais (V2.0)
// js/globals.js - Variáveis globais (V2.0)
//let isUserPro = false;
let proExpiresAt = null;
let proDiasRestantes = 0;
//let usuarioAtual = null;
//let creditosUsuario = 0;
let processandoLogin = false;
let initExecuted = false;
// ✅ CRIAR appState
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
const VERSAO = "7.0.0";
// ✅ EXPORTAR PARA COMPATIBILIDADE (TEMPORÁRIO)
window.usuarioAtual = window.appState.usuario;
window.creditosUsuario = window.appState.creditos;
window.isUserPro = window.appState.isPro;
window.isUserPro = isUserPro;
window.proExpiresAt = proExpiresAt;
window.proDiasRestantes = proDiasRestantes;
window.usuarioAtual = usuarioAtual;
window.creditosUsuario = creditosUsuario;
window.processandoLogin = processandoLogin;
window.initExecuted = initExecuted;
window.VERSAO = VERSAO;

console.log(`🚀 Loterias ${VERSAO} - V2.0`);
