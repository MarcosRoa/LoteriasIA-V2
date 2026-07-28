// js/auth-handler.js - Processamento de login (V2.3 - appState integrado)
// ============================================

// ============================================
// FUNÇÃO PARA ABRIR MODAL DE LOGIN
// ============================================
function mostrarModalLogin() {
    if (document.querySelector('.modal-login-overlay')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-login-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: var(--bg-card, #1e293b);
            border-radius: 16px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border: 1px solid var(--border, #334155);
        ">
            <h2 style="color: var(--text-primary, #fff); margin-bottom: 10px;">🔐 Faça Login</h2>
            <p style="color: var(--text-secondary, #94a3b8); margin-bottom: 20px; font-size: 14px;">
                Entre com sua conta para acessar todos os recursos
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button onclick="window.loginGoogle(); this.closest('.modal-login-overlay').remove();" 
                        style="padding: 12px 20px; background: #db4437; color: white; border: none; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'">
                    🔐 Entrar com Google
                </button>
                <button onclick="window.loginFacebook(); this.closest('.modal-login-overlay').remove();" 
                        style="padding: 12px 20px; background: #4267B2; color: white; border: none; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'">
                    🔐 Entrar com Facebook
                </button>
                <button onclick="this.closest('.modal-login-overlay').remove();" 
                        style="padding: 10px; background: transparent; color: var(--text-secondary, #94a3b8); border: 1px solid var(--border, #334155); border-radius: 30px; font-size: 14px; cursor: pointer; transition: transform 0.2s;"
                        onmouseover="this.style.transform='scale(1.02)'"
                        onmouseout="this.style.transform='scale(1)'">
                    ❌ Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
}

function fecharModalLogin() {
    document.querySelector('.modal-login-overlay')?.remove();
}

function abrirModalComprar() {
    if (!window.appState.usuario) {
        window.mostrarModalLogin();
        return;
    }
    if (document.querySelector('.modal-pix-overlay')) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-pix-overlay';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const valores = [12, 24, 36, 48, 60, 120, 180, 240];
    
    modal.innerHTML = `
        <div style="background: var(--bg-card, #1e293b); border-radius: 16px; padding: 24px; max-width: 400px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid var(--border, #334155);">
            <h2 style="color: #10b981; margin-bottom: 5px;">💰 Comprar Créditos</h2>
            <p style="color: var(--text-secondary, #94a3b8); font-size: 14px; margin-bottom: 15px;">
                Saldo atual: <strong style="color: #f59e0b;">R$ ${window.appState.creditos || 0}</strong>
            </p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0;">
                ${valores.map(v => `
                    <button onclick="window.comprarCreditos(${v}); this.closest('.modal-pix-overlay').remove();" 
                            style="padding: 12px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: white; font-weight: bold; cursor: pointer; font-size: 16px; transition: transform 0.2s;"
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        R$ ${v}
                    </button>
                `).join('')}
            </div>
            <button onclick="this.closest('.modal-pix-overlay').remove();" 
                    style="width: 100%; padding: 12px; background: #64748b; border: none; border-radius: 12px; color: white; cursor: pointer; font-size: 14px; transition: opacity 0.2s;"
                    onmouseover="this.style.opacity='0.8'"
                    onmouseout="this.style.opacity='1'">
                Fechar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
}

async function comprarCreditos(valor) {
    if (!window.appState.usuario) {
        window.mostrarModalLogin();
        return;
    }
    
    try {
        const result = await window.apiClient.createPayment(valor);
        if (result.mode === 'simulation') {
            window.mostrarToast(`✅ R$ ${valor} adicionados!`, 'success');
            window.updateAppState({ creditos: result.newBalance });
            
            const creditsDisplay = document.getElementById('creditosDisplay');
            if (creditsDisplay) creditsDisplay.textContent = `R$ ${result.newBalance}`;
        }
    } catch (error) {
        console.error('Erro ao comprar créditos:', error);
        window.mostrarToast('Erro ao processar pagamento', 'error');
    }
}

// ============================================
// FUNÇÃO PRINCIPAL: PROCESSAR LOGIN
// ============================================
async function processarLogin(user) {
    if (window.processandoLogin) {
        console.log('⏳ Login já sendo processado...');
        return;
    }
    
    window.processandoLogin = true;
    
    try {
        console.log('🔐 Processando login para:', user.email);
        
        const usuario = {
            uid: user.uid,
            nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
            email: user.email,
            foto: user.photoURL,
            isAdmin: false
        };
        
        const credits = await window.apiClient.getCredits();
        const proStatus = await window.apiClient.getProStatus();
        
        // ============================================
        // ✅ ÚNICA ATUALIZAÇÃO DE ESTADO
        // ============================================
        window.updateAppState({
            usuario,
            creditos: credits,
            isPro: proStatus.isPro,
            proDaysLeft: proStatus.daysLeft || 0,
            proExpiresAt: proStatus.proExpiresAt || null
        });
        // No processarLogin(), após updateAppState
        document.body.classList.toggle('user-pro', window.appState.isPro);
        
        // Também no appStateChanged
        document.addEventListener('appStateChanged', function() {
            document.body.classList.toggle('user-pro', window.appState.isPro);
        });
        
        console.log(`📋 Usuário: ${usuario.nome} | PRO: ${window.appState.isPro} | Créditos: ${window.appState.creditos}`);
        
        // ============================================
        // ✅ ORDEM CORRETA: Sincronizar → Renderizar
        // ============================================
        if (typeof window.atualizarBotoesPro === 'function') {
            window.atualizarBotoesPro();
        }
        
        if (typeof window.sincronizarIASelecionada === 'function') {
            window.sincronizarIASelecionada();
        }
        
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            await window.atualizarInterfaceUsuario();
        }
        
        const proMsg = window.appState.isPro ? ' ⭐ PRO' : '';
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast(`Bem-vindo ${usuario.nome}! Saldo: Créditos ${window.appState.creditos}${proMsg}`, 'success');
        }
        
        if (typeof window.renderizarConteudo === 'function') {
            const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
            window.renderizarConteudo(loteria);
        }
        
    } catch (error) {
        console.error('❌ Erro no processarLogin:', error);
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast('Erro ao processar login', 'error');
        }
    } finally {
        window.processandoLogin = false;
    }
}

// ============================================
// EXPORTAÇÕES
// ============================================
window.processarLogin = processarLogin;
window.mostrarModalLogin = mostrarModalLogin;
window.fecharModalLogin = fecharModalLogin;
window.abrirModalComprar = abrirModalComprar;
window.comprarCreditos = comprarCreditos;

console.log('✅ AUTH-HANDLER.js atualizado (V2.3 - appState integrado)');
