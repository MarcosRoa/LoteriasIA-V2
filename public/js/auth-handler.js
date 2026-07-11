// ============================================
// CAMINHO: public/js/auth-handler.js
// ============================================
// VERSÃO 2.1 - USANDO getUserStatus UNIFICADO
// ============================================

async function processarLogin(user) {
    console.log('🔐 Processando login para:', user.email);

    try {
        // 🔥 UMA ÚNICA CHAMADA PARA TUDO
        const status = await window.apiClient.getUserStatus();

        window.usuarioAtual = user;
        window.creditosUsuario = status.credits || 0;
        window.isUserPro = status.isPro || false;
        window.proExpiresAt = status.proExpiresAt || null;
        window.proDaysLeft = status.daysLeft || 0;

        console.log(`📋 Usuário: ${status.email} | PRO: ${status.isPro} | Créditos: ${status.credits}`);

        // Atualizar interface
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            window.atualizarInterfaceUsuario();
        }

        // Disparar evento para outros módulos
        document.dispatchEvent(new CustomEvent('userUpdated', {
            detail: {
                user: window.usuarioAtual,
                credits: window.creditosUsuario,
                isPro: window.isUserPro,
                proDaysLeft: window.proDaysLeft
            }
        }));

        window.mostrarToast(`Bem-vindo ${status.nome}! Saldo: R$ ${status.credits} ${status.isPro ? '⭐ PRO' : ''}`, 'success');

    } catch (error) {
        console.error('❌ Erro ao processar login:', error);
        window.mostrarToast('Erro ao carregar dados do usuário', 'error');
    }
}

// EXPORTAÇÃO
window.processarLogin = processarLogin;

console.log('✅ AUTH-HANDLER.js atualizado (V2.1 - getUserStatus unificado)');
