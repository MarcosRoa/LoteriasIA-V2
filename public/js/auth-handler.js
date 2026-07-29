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

// ============================================
// COMPRAR CRÉDITOS (REAL - COM MERCADO PAGO)
// ============================================
// ============================================
// COMPRAR CRÉDITOS (REAL - COM MERCADO PAGO)
// ============================================
async function comprarCreditos(packageValue) {
    if (!window.appState.usuario) {
        window.mostrarModalLogin();
        return;
    }

    // 🔥 Fechar o modal de seleção
    const modal = document.querySelector('.modal-pix-overlay');
    if (modal) modal.remove();

    try {
        window.mostrarToast('⏳ Gerando pagamento PIX...', 'info');

        const uid = window.appState.usuario.uid;
        const token = await window.apiClient.getFirebaseToken();

        const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-User-Id': uid
            },
            body: JSON.stringify({
                type: 'credits',
                productId: `CREDITS_${packageValue}`,
                idempotencyKey: `${uid}-credits-${packageValue}-${Date.now()}`
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Erro ao criar pagamento');
        }

        window.pagamentoAtual = {
            paymentId: result.paymentId,
            qrCode: result.qrCode,
            qrCodeText: result.qrCodeText,
            expiresAt: result.expiresAt,
            amount: result.amount,
            creditsToAdd: result.creditsToAdd
        };

        abrirModalPagamento(result);
        iniciarPollingPagamento(result.paymentId);

        window.mostrarToast('✅ PIX gerado! Escaneie o QR Code para pagar.', 'success');

    } catch (error) {
        console.error('❌ Erro ao comprar créditos:', error);
        window.mostrarToast('❌ ' + (error.message || 'Erro ao processar pagamento'), 'error');
    }
}

// ============================================
// COMPRAR PRO (REAL - COM MERCADO PAGO)
// ============================================
async function comprarPro() {
    if (!window.appState.usuario) {
        window.mostrarModalLogin();
        return;
    }

    try {
        window.mostrarToast('⏳ Gerando pagamento PIX para PRO...', 'info');

        const uid = window.appState.usuario.uid;
        const token = await window.apiClient.getFirebaseToken();

        const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-User-Id': uid
            },
            body: JSON.stringify({
                type: 'pro',
                productId: 'PRO',
                idempotencyKey: `${uid}-pro-${Date.now()}`
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Erro ao criar pagamento');
        }

        window.pagamentoAtual = {
            paymentId: result.paymentId,
            qrCode: result.qrCode,
            qrCodeText: result.qrCodeText,
            expiresAt: result.expiresAt,
            amount: result.amount,
            productType: 'pro'
        };

        abrirModalPagamento(result, 'pro');
        iniciarPollingPagamento(result.paymentId);

        window.mostrarToast('✅ PIX gerado! Escaneie o QR Code para ativar o PRO.', 'success');

    } catch (error) {
        console.error('❌ Erro ao comprar PRO:', error);
        window.mostrarToast('❌ ' + (error.message || 'Erro ao processar pagamento'), 'error');
    }
}

// ============================================
// ABRIR MODAL COM QR CODE PIX
// ============================================
function abrirModalPagamento(paymentData, type = 'credits') {
    document.querySelector('.modal-pagamento-overlay')?.remove();

    const isPro = type === 'pro';
    const title = isPro ? '⭐ Assinar PRO' : '💰 Comprar Créditos';
    const description = isPro 
        ? 'R$ 20,00 - 15 dias de PRO'
        : `${paymentData.creditsToAdd || paymentData.amount} créditos`;

    const modal = document.createElement('div');
    modal.className = 'modal-pagamento-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: var(--bg-card, #1e293b);
            border-radius: 16px;
            padding: 30px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            border: 1px solid var(--border, #334155);
            position: relative;
        ">
            <button onclick="this.closest('.modal-pagamento-overlay').remove();" 
                    style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;">
                ✕
            </button>
            
            <h2 style="color: ${isPro ? '#f59e0b' : '#10b981'}; margin-bottom: 5px;">${title}</h2>
            <p style="color: var(--text-secondary, #94a3b8); font-size: 14px; margin-bottom: 15px;">
                Valor: <strong style="color: #f59e0b;">R$ ${paymentData.amount}</strong>
                <br>${description}
            </p>

            <div style="background: white; padding: 20px; border-radius: 12px; margin: 15px 0;">
                <img src="data:image/png;base64,${paymentData.qrCode}" alt="QR Code PIX" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
            </div>

            <div style="background: rgba(56, 189, 248, 0.1); padding: 12px; border-radius: 8px; margin: 10px 0;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">Código PIX (copia e cola):</p>
                <p style="font-size: 11px; color: #38bdf8; word-break: break-all; margin: 5px 0; cursor: pointer;" 
                   onclick="navigator.clipboard.writeText('${paymentData.qrCodeText}'); window.mostrarToast('Código copiado!', 'success')">
                    ${paymentData.qrCodeText}
                </p>
            </div>

            <div style="margin: 15px 0; padding: 10px; border-radius: 8px; background: rgba(251, 191, 36, 0.05); border: 1px solid #fbbf24;">
                <p style="font-size: 12px; color: #fbbf24; margin: 0;">
                    💡 Você pode fechar esta janela. 
                    Assim que o pagamento for confirmado, 
                    ${isPro ? 'seu PRO será ativado' : 'seus créditos serão adicionados'} automaticamente.
                </p>
            </div>

            <div id="pagamentoStatus" style="margin: 15px 0; padding: 10px; border-radius: 8px; background: rgba(251, 191, 36, 0.1); border: 1px solid #fbbf24;">
                <span style="color: #fbbf24;">⏳ Aguardando pagamento...</span>
                <br>
                <span style="font-size: 12px; color: #94a3b8;">O pagamento será confirmado automaticamente</span>
            </div>

            <button onclick="this.closest('.modal-pagamento-overlay').remove();" 
                    style="width: 100%; padding: 12px; background: #64748b; border: none; border-radius: 12px; color: white; cursor: pointer; font-size: 14px;">
                Fechar
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
}

// ============================================
// POLLING PARA VERIFICAR STATUS DO PAGAMENTO
// ============================================
function iniciarPollingPagamento(paymentId) {
    if (window._pollingInterval) {
        clearInterval(window._pollingInterval);
    }

    let tentativas = 0;
    const maxTentativas = 60; // 5 minutos

    window._pollingInterval = setInterval(async () => {
        tentativas++;

        try {
            const response = await fetch(`/api/payment/status?paymentId=${paymentId}`);
            const result = await response.json();

            if (result.status === 'confirmed') {
                clearInterval(window._pollingInterval);
                window._pollingInterval = null;

                const statusDiv = document.getElementById('pagamentoStatus');
                if (statusDiv) {
                    statusDiv.style.background = 'rgba(34, 197, 94, 0.1)';
                    statusDiv.style.border = '1px solid #22c55e';
                    statusDiv.innerHTML = `
                        <span style="color: #22c55e;">✅ PAGAMENTO CONFIRMADO!</span>
                        <br>
                        <span style="font-size: 12px; color: #94a3b8;">${result.payment?.product_type === 'pro' ? 'PRO ativado!' : 'Créditos adicionados!'}</span>
                    `;
                }

                // 🔥 RECARREGAR DADOS DO BACKEND
                try {
                    const creditsResponse = await fetch('/api/credits?uid=' + window.appState.usuario.uid);
                    const creditsData = await creditsResponse.json();
                    
                    window.updateAppState({
                        creditos: creditsData.credits || 0,
                        isPro: creditsData.isPro || false
                    });

                    if (typeof window.atualizarInterfaceUsuario === 'function') {
                        window.atualizarInterfaceUsuario();
                    }
                } catch (error) {
                    console.error('❌ Erro ao recarregar créditos:', error);
                }

                window.mostrarToast('✅ Pagamento confirmado!', 'success');

                setTimeout(() => {
                    document.querySelector('.modal-pagamento-overlay')?.remove();
                }, 3000);

            } else if (result.status === 'pending') {
                const statusDiv = document.getElementById('pagamentoStatus');
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <span style="color: #fbbf24;">⏳ Aguardando pagamento... (${tentativas}s)</span>
                        <br>
                        <span style="font-size: 12px; color: #94a3b8;">O pagamento será confirmado automaticamente</span>
                    `;
                }
            }

            if (tentativas >= maxTentativas) {
                clearInterval(window._pollingInterval);
                window._pollingInterval = null;
                const statusDiv = document.getElementById('pagamentoStatus');
                if (statusDiv) {
                    statusDiv.style.background = 'rgba(239, 68, 68, 0.1)';
                    statusDiv.style.border = '1px solid #ef4444';
                    statusDiv.innerHTML = `
                        <span style="color: #ef4444;">⏰ Tempo limite excedido</span>
                        <br>
                        <span style="font-size: 12px; color: #94a3b8;">O pagamento será confirmado quando recebido</span>
                    `;
                }
            }

        } catch (error) {
            console.error('❌ Erro no polling:', error);
        }
    }, 5000);
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
window.comprarPro = comprarPro;
window.abrirModalPagamento = abrirModalPagamento;
window.iniciarPollingPagamento = iniciarPollingPagamento;

console.log('✅ AUTH-HANDLER.js atualizado (V2.3 - appState integrado)');
