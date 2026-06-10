// js/init.js - Inicialização do sistema (V2.0)
// js/init.js - Inicialização do sistema (V2.0)
async function init() {
    if (window.initExecuted) {
        console.log('⚠️ init já executado, ignorando');
        return;
    }
    window.initExecuted = true;
    
    console.log('🚀 Inicializando sistema V2.0...');
    
    if (typeof window.carregarTema === 'function') window.carregarTema();
    if (typeof window.carregarGridLoterias === 'function') {
        window.carregarGridLoterias();
    } else {
        console.error('❌ carregarGridLoterias não disponível');
    }
    
    if (typeof window.onAuthStateChanged === 'function') {
        window.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('✅ Usuário autenticado:', user.email);
                await window.processarLogin(user);
            } else {
                console.log('👤 Nenhum usuário autenticado');
                window.usuarioAtual = null;
                window.creditosUsuario = 0;
                window.isUserPro = false;
                if (typeof window.atualizarInterfaceUsuario === 'function') {
                    window.atualizarInterfaceUsuario();
                }
            }
        });
    }
    
    setTimeout(async () => {
        const loteriaAtual = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
        const dadosAtuais = window.dadosAtuais ? window.dadosAtuais() : [];
        if (dadosAtuais.length === 0) {
            if (typeof window.selecionarLoteria === 'function') {
                await window.selecionarLoteria('megasena');
            }
        }
    }, 2000);
}

function checkAndInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

window.init = init;
window.checkAndInit = checkAndInit;

checkAndInit();
