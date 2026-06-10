// js/user-interface.js - VERSÃO 2.0
// js/user-interface.js - Interface do usuário (V2.0)
async function buscarCreditosAPI() {
    try {
        const credits = await window.apiClient.getCredits();
        if (credits !== window.creditosUsuario) window.creditosUsuario = credits;
        return credits;
    } catch (error) {
        console.error('Erro ao buscar créditos:', error);
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
            ? `<img src="${window.usuarioAtual.foto}" class="user-avatar" alt="Avatar" style="object-fit: cover; width: 40px; height: 40px; border-radius: 50%;">`
            : `<div class="user-avatar" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">👤</div>`;
        
        const proBadgeHtml = window.isUserPro ? '<span class="pro-badge" style="background: #f59e0b; padding: 2px 8px; border-radius: 20px; font-size: 10px;">⭐ PRO</span>' : '';
        
        if (userInfoArea) {
            userInfoArea.innerHTML = `
                <div class="user-info" style="display: flex; align-items: center; gap: 12px;">
                    ${avatarHtml}
                    <div>
                        <h4 style="margin: 0;">${window.usuarioAtual.nome} ${proBadgeHtml}</h4>
                        <p style="margin: 0; font-size: 11px;">${window.usuarioAtual.email}</p>
                    </div>
                </div>
                <div class="credits-box" onclick="window.abrirPerfil()" style="cursor: pointer;">
                    <span>💰 CRÉDITOS</span>
                    <strong id="creditosDisplay">R$ ${window.creditosUsuario || 0}</strong>
                </div>
                <button class="btn-comprar" onclick="window.abrirModalComprar()">➕ Comprar</button>
                <button class="btn-perfil" onclick="window.abrirPerfil()">👤 Perfil</button>
                <button class="btn-tema" onclick="window.toggleTema()">🌓 Tema</button>
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

async function comprarCreditos(valor) {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    try {
        const result = await window.apiClient.createPayment(valor);
        if (result.mode === 'simulation') {
            window.mostrarToast(`✅ R$ ${valor} adicionados!`, 'success');
            window.creditosUsuario = result.newBalance;
            await window.atualizarInterfaceUsuario();
            const display = document.getElementById('creditosDisplay');
            if (display) display.innerText = `R$ ${result.newBalance}`;
        }
    } catch (error) {
        console.error('Erro:', error);
        window.mostrarToast('Erro ao processar pagamento', 'error');
    }
}

function abrirPerfil() {
    if (!window.usuarioAtual) {
        if (typeof window.mostrarModalLogin === 'function') window.mostrarModalLogin();
        return;
    }
    
    sessionStorage.setItem('perfil_usuario', JSON.stringify({
        uid: window.usuarioAtual.uid,
        nome: window.usuarioAtual.nome,
        email: window.usuarioAtual.email,
        foto: window.usuarioAtual.foto,
        creditos: window.creditosUsuario,
        isPro: window.isUserPro,
        proExpiresAt: window.proExpiresAt
    }));
    
    window.location.href = 'perfil.html';
}

function abrirModalComprar() {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    if (document.querySelector('.modal-pix-overlay')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-pix-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: 16px; padding: 24px; max-width: 400px; width: 90%;">
            <h2 style="color: #10b981;">💰 Comprar Créditos</h2>
            <p>Saldo atual: <strong>R$ ${window.creditosUsuario || 0}</strong></p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0;">
                ${[12, 24, 36, 48, 60, 120, 180, 240].map(v => `
                    <button onclick="window.comprarCreditos(${v}); this.closest('.modal-pix-overlay').remove()" style="padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer;">
                        R$ ${v}
                    </button>
                `).join('')}
            </div>
            <button onclick="this.closest('.modal-pix-overlay').remove()" style="width: 100%; padding: 12px; background: #64748b; border: none; border-radius: 12px; color: white; cursor: pointer;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modal);
}

window.comprarCreditos = comprarCreditos;
window.buscarCreditosAPI = buscarCreditosAPI;
window.atualizarInterfaceUsuario = atualizarInterfaceUsuario;
window.abrirPerfil = abrirPerfil;
window.abrirModalComprar = abrirModalComprar;
window.simularPix = comprarCreditos;

console.log('✅ USER-INTERFACE.js carregado (V2.0)');
