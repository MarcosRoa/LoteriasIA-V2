// js/auth-handler.js - Processamento de login (V2.3 - appState integrado)
// ============================================

// ============================================
// FUNÇÃO PARA ABRIR MODAL DE LOGIN 13/08/2026
// ============================================
function mostrarModalLogin(modo = 'opcoes') {
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
        <div style="background: var(--bg-card, #1e293b); border-radius: 16px; padding: 30px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid var(--border, #334155);">
            <div id="loginModalBody"></div>
        </div>
    `;

    document.body.appendChild(modal);
    const body = modal.querySelector('#loginModalBody');

    function mostrarOpcoesLogin() {
        body.innerHTML = `
            <h2 style="color: var(--text-primary, #fff); margin-bottom: 10px;">🔐 Faça Login</h2>
            <p style="color: var(--text-secondary, #94a3b8); margin-bottom: 20px; font-size: 14px;">Entre com sua conta para acessar todos os recursos</p>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <button onclick="window.loginGoogle();" style="padding:12px 20px; background:#db4437; color:white; border:none; border-radius:30px; font-size:16px; font-weight:600; cursor:pointer;">🔐 Entrar com Google</button>
                <button id="btnLoginEmail" style="padding:12px 20px; background:#334155; color:white; border:none; border-radius:30px; font-size:16px; font-weight:600; cursor:pointer;">✉️ Entrar com e-mail</button>

                <!--
                FACEBOOK — MANTIDO E DESATIVADO.
                Não apagar a implementação existente.
                <button onclick="window.loginFacebook();">🔐 Entrar com Facebook</button>
                -->

                <button onclick="this.closest('.modal-login-overlay').remove();" style="padding:10px; background:transparent; color:var(--text-secondary,#94a3b8); border:1px solid var(--border,#334155); border-radius:30px; font-size:14px; cursor:pointer;">❌ Fechar</button>
            </div>
        `;
        body.querySelector('#btnLoginEmail').addEventListener('click', mostrarLoginEmail);
    }

    function mostrarLoginEmail(mensagem = '') {
        body.innerHTML = `
            <h2 style="color:var(--text-primary,#fff); margin-bottom:10px;">✉️ Entrar com e-mail</h2>
            <p style="color:var(--text-secondary,#94a3b8); margin-bottom:18px; font-size:14px;">Informe seu e-mail e senha para continuar.</p>
            <form id="emailLoginForm" style="display:flex;flex-direction:column;gap:12px;text-align:left;">
                <label style="color:var(--text-secondary,#94a3b8);font-size:13px;">E-mail
                    <input id="loginEmailInput" type="email" autocomplete="email" required style="width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                </label>
                <label style="color:var(--text-secondary,#94a3b8);font-size:13px;">Senha
                    <input id="loginPasswordInput" type="password" autocomplete="current-password" required style="width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                </label>
                <div id="loginEmailMessage" style="font-size:13px;color:#fbbf24;text-align:center;min-height:18px;">${mensagem}</div>
                <button type="submit" style="padding:12px 20px;background:#2563eb;color:white;border:none;border-radius:30px;font-size:16px;font-weight:600;cursor:pointer;">Entrar</button>
                <button type="button" id="btnForgotPassword" style="background:transparent;border:none;color:#38bdf8;cursor:pointer;font-size:13px;">Esqueci minha senha</button>
                <button type="button" id="btnCreateAccount" style="background:transparent;border:none;color:#10b981;cursor:pointer;font-size:14px;font-weight:600;">Não tenho conta — Criar uma conta</button>
                <button type="button" id="btnBackLogin" style="padding:10px;background:transparent;color:var(--text-secondary,#94a3b8);border:1px solid var(--border,#334155);border-radius:30px;cursor:pointer;">← Voltar</button>
            </form>
        `;

        body.querySelector('#emailLoginForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = body.querySelector('#loginEmailInput').value.trim();
            const password = body.querySelector('#loginPasswordInput').value;
            const messageEl = body.querySelector('#loginEmailMessage');
            const button = event.submitter;
            button.disabled = true;
            button.textContent = 'Entrando...';
            messageEl.textContent = '';

            const result = await window.loginEmail(email, password);
            if (result.success) return;

            button.disabled = false;
            button.textContent = 'Entrar';
            messageEl.textContent = result.message || 'Não foi possível entrar.';
            if (result.unverified) mostrarVerificacaoEmail(email, password);
        });

        body.querySelector('#btnForgotPassword').addEventListener('click', () => {
            mostrarRecuperacaoSenha(body.querySelector('#loginEmailInput').value.trim());
        });
        body.querySelector('#btnCreateAccount').addEventListener('click', mostrarCadastro);
        body.querySelector('#btnBackLogin').addEventListener('click', mostrarOpcoesLogin);
    }

    function mostrarCadastro() {
        body.innerHTML = `
            <h2 style="color:var(--text-primary,#fff); margin-bottom:10px;">📝 Criar conta</h2>
            <p style="color:var(--text-secondary,#94a3b8); margin-bottom:18px; font-size:14px;">Crie sua conta para acessar todos os recursos.</p>
            <form id="registerForm" style="display:flex;flex-direction:column;gap:12px;text-align:left;">
                <label style="color:var(--text-secondary,#94a3b8);font-size:13px;">Nome
                    <input id="registerNameInput" type="text" autocomplete="name" required style="width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                </label>
                <label style="color:var(--text-secondary,#94a3b8);font-size:13px;">E-mail
                    <input id="registerEmailInput" type="email" autocomplete="email" required style="width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                </label>
                <label style="color:var(--text-secondary,#94a3b8);font-size:13px;">Senha
                    <input id="registerPasswordInput" type="password" autocomplete="new-password" minlength="6" required style="width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                </label>
                <label style="color:var(--text-secondary,#94a3b8);font-size:13px;">Confirmar senha
                    <input id="registerPasswordConfirmInput" type="password" autocomplete="new-password" minlength="6" required style="width:100%;box-sizing:border-box;margin-top:6px;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                </label>
                <div id="registerMessage" style="font-size:13px;color:#fbbf24;text-align:center;min-height:18px;"></div>
                <button type="submit" style="padding:12px 20px;background:#10b981;color:white;border:none;border-radius:30px;font-size:16px;font-weight:600;cursor:pointer;">Criar conta</button>
                <button type="button" id="btnBackRegister" style="padding:10px;background:transparent;color:var(--text-secondary,#94a3b8);border:1px solid var(--border,#334155);border-radius:30px;cursor:pointer;">← Voltar</button>
            </form>
        `;

        body.querySelector('#registerForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = body.querySelector('#registerNameInput').value.trim();
            const email = body.querySelector('#registerEmailInput').value.trim();
            const password = body.querySelector('#registerPasswordInput').value;
            const confirm = body.querySelector('#registerPasswordConfirmInput').value;
            const messageEl = body.querySelector('#registerMessage');
            const button = event.submitter;

            if (password !== confirm) {
                messageEl.textContent = 'As senhas não coincidem.';
                return;
            }

            button.disabled = true;
            button.textContent = 'Criando...';
            const result = await window.registerEmail(email, password, name);

            if (result.success) {
                mostrarVerificacaoEmail(email, password, true);
                return;
            }

            button.disabled = false;
            button.textContent = 'Criar conta';
            messageEl.textContent = result.message || 'Não foi possível criar a conta.';
        });

        body.querySelector('#btnBackRegister').addEventListener('click', mostrarLoginEmail);
    }

    function mostrarVerificacaoEmail(email, password, recemCriada = false) {
        body.innerHTML = `
            <h2 style="color:#10b981;margin-bottom:10px;">📧 Verifique seu e-mail</h2>
            <p style="color:var(--text-secondary,#94a3b8);font-size:14px;line-height:1.5;">${recemCriada ? 'Sua conta foi criada. Enviamos um e-mail de confirmação para:' : 'Seu e-mail ainda não foi confirmado.'}</p>
            <p style="color:#38bdf8;font-weight:600;word-break:break-word;">${email}</p>
            <p style="color:var(--text-secondary,#94a3b8);font-size:13px;">Confirme o endereço pelo e-mail e depois volte aqui para fazer o login.</p>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:18px;">
                <button id="btnResendVerification" style="padding:12px;background:#2563eb;color:white;border:none;border-radius:30px;font-weight:600;cursor:pointer;">Reenviar e-mail</button>
                <button id="btnVerificationLogin" style="padding:12px;background:#10b981;color:white;border:none;border-radius:30px;font-weight:600;cursor:pointer;">Já confirmei meu e-mail</button>
                <button id="btnCloseVerification" style="padding:10px;background:transparent;color:var(--text-secondary,#94a3b8);border:1px solid var(--border,#334155);border-radius:30px;cursor:pointer;">❌ Fechar</button>
            </div>
            <div id="verificationMessage" style="margin-top:12px;font-size:13px;color:#fbbf24;min-height:18px;"></div>
        `;

        body.querySelector('#btnResendVerification').addEventListener('click', async () => {
            const button = body.querySelector('#btnResendVerification');
            const messageEl = body.querySelector('#verificationMessage');
            button.disabled = true;
            button.textContent = 'Enviando...';
            const result = await window.resendVerificationEmail(email, password);
            button.disabled = false;
            button.textContent = 'Reenviar e-mail';
            messageEl.textContent = result.message;
            if (result.verified) setTimeout(() => mostrarLoginEmail(), 1000);
        });

        body.querySelector('#btnVerificationLogin').addEventListener('click', () => mostrarLoginEmail());
        body.querySelector('#btnCloseVerification').addEventListener('click', () => modal.remove());
    }

    function mostrarRecuperacaoSenha(emailInicial = '') {
        body.innerHTML = `
            <h2 style="color:var(--text-primary,#fff);margin-bottom:10px;">🔑 Recuperar senha</h2>
            <p style="color:var(--text-secondary,#94a3b8);font-size:14px;margin-bottom:18px;">Informe seu e-mail para receber o link de recuperação.</p>
            <form id="resetForm" style="display:flex;flex-direction:column;gap:12px;">
                <input id="resetEmailInput" type="email" autocomplete="email" required value="${emailInicial.replace(/"/g, '&quot;')}" placeholder="Seu e-mail" style="width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid var(--border,#334155);background:#0f172a;color:white;">
                <div id="resetMessage" style="font-size:13px;color:#fbbf24;min-height:18px;"></div>
                <button type="submit" style="padding:12px;background:#2563eb;color:white;border:none;border-radius:30px;font-weight:600;cursor:pointer;">Enviar recuperação</button>
                <button type="button" id="btnBackReset" style="padding:10px;background:transparent;color:var(--text-secondary,#94a3b8);border:1px solid var(--border,#334155);border-radius:30px;cursor:pointer;">← Voltar</button>
            </form>
        `;

        body.querySelector('#resetForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = event.submitter;
            const email = body.querySelector('#resetEmailInput').value.trim();
            const messageEl = body.querySelector('#resetMessage');
            button.disabled = true;
            button.textContent = 'Enviando...';
            const result = await window.resetPassword(email);
            button.disabled = false;
            button.textContent = 'Enviar recuperação';
            messageEl.textContent = result.message;
        });
        body.querySelector('#btnBackReset').addEventListener('click', mostrarLoginEmail);
    }

    if (modo === 'email') {
        mostrarLoginEmail();
    } else {
        mostrarOpcoesLogin();
    }

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

            if (result.status === 'approved' || result.status === 'confirmed') {
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
