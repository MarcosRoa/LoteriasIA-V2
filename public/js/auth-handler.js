// ============================================
// CAMINHO: public/js/auth-handler.js
// ============================================
// VERSÃO 2.2 - CORRIGIDO (EXTRAIR NOME CORRETAMENTE)
// ============================================

async function processarLogin(user) {
    console.log('🔐 Processando login para:', user?.email);

    try {
        // 🔥 BUSCAR STATUS DO USUÁRIO
        const status = await window.apiClient.getUserStatus();
        console.log('📊 Status recebido:', status);

        // ============================================
        // 🔥 EXTRAIR NOME CORRETAMENTE
        // ============================================
        const nome = status.user?.nome || 
                     status.user?.name || 
                     status.nome || 
                     status.name || 
                     user?.displayName || 
                     user?.email?.split('@')[0] || 
                     'Usuário';

        const email = status.user?.email || user?.email || '';
        const foto = status.user?.foto || user?.photoURL || null;

        // ============================================
        // 🔥 ATUALIZAR VARIÁVEIS GLOBAIS
        // ============================================
        window.usuarioAtual = {
            ...user,
            uid: user?.uid || status.user?.uid,
            nome: nome,
            displayName: nome,
            email: email,
            photoURL: foto
        };

        window.creditosUsuario = status.credits || 0;
        window.isUserPro = status.isPro || false;
        window.proExpiresAt = status.proExpiresAt || null;
        window.proDaysLeft = status.daysLeft || 0;

        console.log(`📋 Usuário: ${nome} | PRO: ${window.isUserPro} | Créditos: ${window.creditosUsuario}`);

        // ============================================
        // 🔥 ATUALIZAR INTERFACE
        // ============================================
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            window.atualizarInterfaceUsuario();
        }

        // ============================================
        // 🔥 DISPARAR EVENTO PARA OUTROS MÓDULOS
        // ============================================
        document.dispatchEvent(new CustomEvent('userUpdated', {
            detail: {
                user: window.usuarioAtual,
                credits: window.creditosUsuario,
                isPro: window.isUserPro,
                proDaysLeft: window.proDaysLeft
            }
        }));

        // ============================================
        // 🔥 TOAST DE BOAS-VINDAS
        // ============================================
        const saldoMsg = window.creditosUsuario !== undefined && window.creditosUsuario !== null 
            ? `R$ ${window.creditosUsuario}` 
            : '0';

        const proMsg = window.isUserPro ? ' ⭐ PRO' : '';
        window.mostrarToast(`Bem-vindo ${nome}! Saldo: ${saldoMsg}${proMsg}`, 'success');

        // ============================================
        // 🔥 ATUALIZAR BOTÕES PRO
        // ============================================
        if (typeof window.atualizarBotoesPro === 'function') {
            window.atualizarBotoesPro();
        }

    } catch (error) {
        console.error('❌ Erro ao processar login:', error);
        window.mostrarToast('Erro ao carregar dados do usuário', 'error');
    }
}

// ============================================
// 🔥 MOSTRAR MODAL DE LOGIN
// ============================================
function mostrarModalLogin() {
    const modal = document.getElementById('loginModal') || document.getElementById('userPanel');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
    } else {
        // Fallback: redirecionar para a área de login
        const loginArea = document.getElementById('loginArea');
        if (loginArea) {
            loginArea.style.display = 'block';
        }
        window.mostrarToast('Por favor, faça login para continuar.', 'warning');
    }
}

// ============================================
// 🔥 FECHAR MODAL DE LOGIN
// ============================================
function fecharModalLogin() {
    const modal = document.getElementById('loginModal') || document.getElementById('userPanel');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
    }
}

// ============================================
// 🔥 ABRIR MODAL DE COMPRA
// ============================================
function abrirModalComprar() {
    const modal = document.getElementById('comprarModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
    } else {
        window.mostrarToast('💳 Compre créditos para continuar gerando jogos.', 'warning');
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.processarLogin = processarLogin;
window.mostrarModalLogin = mostrarModalLogin;
window.fecharModalLogin = fecharModalLogin;
window.abrirModalComprar = abrirModalComprar;

console.log('✅ AUTH-HANDLER.js atualizado (V2.2 - Nome corrigido)');
