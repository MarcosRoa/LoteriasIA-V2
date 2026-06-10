// js/user-interface.js - VERSÃO 2.0
// ============================================

async function buscarCreditosAPI() {
    try {
        const credits = await window.apiClient.getCredits();
        if (credits !== window.creditosUsuario) {
            window.creditosUsuario = credits;
        }
        return credits;
    } catch (error) {
        console.error('Erro ao buscar créditos via API:', error);
        return window.creditosUsuario || 0;
    }
}

async function atualizarInterfaceUsuario() {
    const loginArea = document.getElementById('loginArea');
    const userInfoArea = document.getElementById('userInfoArea');
    
    if (window.usuarioAtual) {
        if (loginArea) loginArea.style.display = 'none';
        if (userInfoArea) {
            userInfoArea.style.display = 'flex';
            userInfoArea.style.justifyContent = 'center';
            userInfoArea.style.alignItems = 'center';
            userInfoArea.style.gap = '12px';
            userInfoArea.style.flexWrap = 'wrap';
        }
        
        await buscarCreditosAPI();
        
        const avatarHtml = window.usuarioAtual.foto 
            ? `<img src="${window.usuarioAtual.foto}" class="user-avatar" alt="Avatar" style="object-fit: cover;">`
            : `<div class="user-avatar" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); display: flex; align-items: center; justify-content: center;">👤</div>`;
        
        const proBadgeHtml = window.isUserPro ? '<span class="pro-badge">⭐ PRO</span>' : '';
        
        if (userInfoArea) {
            userInfoArea.innerHTML = `
                <div class="user-info">
                    ${avatarHtml}
                    <div class="user-details">
                        <h4>${window.usuarioAtual.nome} ${proBadgeHtml}</h4>
                        <p>${window.usuarioAtual.email}</p>
                    </div>
                </div>
                <div class="credits-box" onclick="window.abrirPerfil()">
                    <span>💰 MEUS CRÉDITOS</span>
                    <strong id="creditosDisplay">R$ ${window.creditosUsuario || 0}</strong>
                </div>
                <button class="btn-comprar" onclick="window.abrirModalComprar()">➕ Comprar Créditos</button>
                ${!window.isUserPro ? '<button class="btn-pro" onclick="window.ativarPro()">⭐ ATIVAR PRO</button>' : ''}
                <button class="btn-perfil" onclick="window.abrirPerfil()">👤 Meu Perfil</button>
                <button class="btn-tema" onclick="window.toggleTema()">🌓 Tema</button>
                <span class="status-online">🟢 Online</span>
                <button class="btn-logout" onclick="window.logout()">🚪 Sair</button>
            `;
        }
    } else {
        if (loginArea) loginArea.style.display = 'block';
        if (userInfoArea) {
            userInfoArea.style.display = 'none';
            userInfoArea.innerHTML = '';
        }
    }
}

// Compra de créditos (simulação)
async function comprarCreditos(valor) {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    try {
        const result = await window.apiClient.createPayment(valor);
        
        if (result.mode === 'simulation') {
            window.mostrarToast(`✅ R$ ${valor} adicionados com sucesso!`, 'success');
            window.creditosUsuario = result.newBalance;
            await window.atualizarInterfaceUsuario();
            
            // Atualizar display de créditos
            const display = document.getElementById('creditosDisplay');
            if (display) display.innerText = `R$ ${result.newBalance}`;
        }
    } catch (error) {
        console.error('Erro ao comprar créditos:', error);
        window.mostrarToast('Erro ao processar pagamento', 'error');
    }
}

// Exportar
window.comprarCreditos = comprarCreditos;
window.buscarCreditosAPI = buscarCreditosAPI;
window.simularPix = comprarCreditos;

console.log('✅ USER-INTERFACE.js atualizado (V2.0)');
