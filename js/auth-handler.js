// js/auth-handler.js - Processamento de login (V2.0)
async function processarLogin(user) {
    if (window.processandoLogin) {
        console.log('⏳ Login já sendo processado...');
        return;
    }
    
    window.processandoLogin = true;
    
    try {
        console.log('🔐 Processando login para:', user.email);
        
        window.usuarioAtual = {
            uid: user.uid,
            nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
            email: user.email,
            foto: user.photoURL,
            isAdmin: false
        };
        
        const credits = await window.apiClient.getCredits();
        window.creditosUsuario = credits;
        
        const proStatus = await window.apiClient.getProStatus();
        window.isUserPro = proStatus.isPro;
        window.proDiasRestantes = proStatus.daysLeft || 0;
        
        console.log(`📋 Usuário: ${user.email} | PRO: ${window.isUserPro} | Créditos: ${window.creditosUsuario}`);
        
        window.usuarioAtual.isPro = window.isUserPro;
        
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            await window.atualizarInterfaceUsuario();
        }
        
        const proMsg = window.isUserPro ? ' ⭐ PRO' : '';
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`Bem-vindo ${window.usuarioAtual.nome}! Saldo: R$ ${window.creditosUsuario}${proMsg}`, 'success');
        }
        
        setTimeout(() => {
            if (typeof window.renderizarConteudo === 'function') {
                const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
                window.renderizarConteudo(loteria);
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ Erro no processarLogin:', error);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('Erro ao processar login', 'error');
        }
    } finally {
        window.processandoLogin = false;
    }
}

window.processarLogin = processarLogin;

console.log('✅ AUTH-HANDLER.js atualizado (V2.0)');
