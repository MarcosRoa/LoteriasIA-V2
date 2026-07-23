// ============================================
// CAMINHO: public/js/user-interface.js
// ============================================
// VERSÃO 2.1 - CORRIGIDO (MOSTRAR NOME)
// ============================================

// ============================================
// ATUALIZAR INTERFACE DO USUÁRIO
// ============================================
function atualizarInterfaceUsuario() {
    console.log('🔄 Atualizando interface do usuário...');

    const userInfoArea = document.getElementById('userInfoArea');
    const loginArea = document.getElementById('loginArea');

    if (!userInfoArea) {
        console.warn('⚠️ Elemento userInfoArea não encontrado');
        return;
    }

    // ============================================
    // 🔥 EXTRAIR INFORMAÇÕES DO USUÁRIO
    // ============================================
    const usuario = window.usuarioAtual || {};
    const nome = usuario.nome || usuario.displayName || usuario.email?.split('@')[0] || 'Usuário';
    const email = usuario.email || '';
    const foto = usuario.photoURL || usuario.foto || null;
    const credits = window.creditosUsuario ?? 0;
    const isPro = window.isUserPro || false;
    const daysLeft = window.proDaysLeft || 0;

    // ============================================
    // 🔥 VERIFICAR SE ESTÁ LOGADO
    // ============================================
    if (usuario && usuario.uid) {
        // ============================================
        // 🔥 EXIBIR INFORMAÇÕES DO USUÁRIO LOGADO
        // ============================================
        if (loginArea) loginArea.style.display = 'none';
        userInfoArea.style.display = 'block';

        // ============================================
        // 🔥 MONTAR HTML
        // ============================================
        const proBadge = isPro 
            ? '<span class="badge-pro">⭐ PRO</span>' 
            : '<span class="badge-free">FREE</span>';

        const daysMsg = isPro && daysLeft > 0 
            ? `<span style="font-size: 11px; color: #94a3b8;">(${daysLeft} dias)</span>` 
            : '';

        const fotoHtml = foto 
            ? `<img src="${foto}" alt="${nome}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">` 
            : `<span style="font-size: 24px;">👤</span>`;

        userInfoArea.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 8px 0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${fotoHtml}
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary); font-size: 14px;">
                            ${nome}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8;">
                            ${email}
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-card); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border);">
                        <span style="font-size: 14px;">💰</span>
                        <span style="font-weight: 600; color: #f59e0b; font-size: 14px;">
                            R$ ${credits}
                        </span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 4px;">
                        ${proBadge}
                        ${daysMsg}
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                    <button onclick="window.abrirModalComprar()" 
                            style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; padding: 6px 16px; border-radius: 20px; color: #1e293b; font-weight: 600; font-size: 12px; cursor: pointer;">
                        💳 Comprar
                    </button>
                    <a href="/perfil.html" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); border: none; padding: 6px 16px; border-radius: 20px; color: white; font-weight: 600; font-size: 12px; text-decoration: none; cursor: pointer; display: inline-block;">
                        👤 Meu Perfil
                    </a>
                    <button onclick="window.deslogar()" 
                            style="background: transparent; border: 1px solid #ef4444; padding: 6px 16px; border-radius: 20px; color: #ef4444; font-weight: 600; font-size: 12px; cursor: pointer;">
                        Sair
                    </button>
                </div>
            </div>
        `;

    } else {
        // ============================================
        // 🔥 EXIBIR ÁREA DE LOGIN
        // ============================================
        if (loginArea) loginArea.style.display = 'block';
        userInfoArea.style.display = 'none';
    }

    console.log('✅ Interface atualizada');
}

// ============================================
// 🔥 BUSCAR CRÉDITOS DA API
// ============================================
async function buscarCreditosAPI() {
    try {
        if (window.apiClient && typeof window.apiClient.getCredits === 'function') {
            const credits = await window.apiClient.getCredits();
            if (credits !== undefined && credits !== null) {
                window.creditosUsuario = credits;
                console.log('💰 Créditos atualizados:', credits);
                atualizarInterfaceUsuario();
                return credits;
            }
        }
        return window.creditosUsuario || 0;
    } catch (error) {
        console.error('❌ Erro ao buscar créditos:', error);
        return window.creditosUsuario || 0;
    }
}

// ============================================
// 🔥 ATUALIZAR INTERFACE DO JOGO
// ============================================
function atualizarInterfaceJogo(loteriaId) {
    // Atualiza o grid de loterias
    const cards = document.querySelectorAll('.lottery-card-stats');
    cards.forEach(card => {
        card.classList.remove('active');
        if (card.dataset.loteria === loteriaId) {
            card.classList.add('active');
        }
    });

    // Atualiza o título
    const titulo = document.getElementById('tituloLoteria');
    if (titulo) {
        const config = window.LOTERIAS?.[loteriaId];
        if (config) {
            titulo.textContent = `${config.icone} ${config.nome}`;
        }
    }
}

// ============================================
// 🔥 CARREGAR DADOS DO USUÁRIO
// ============================================
async function carregarDadosUsuario() {
    try {
        const user = firebase.auth().currentUser;
        if (user) {
            await window.processarLogin(user);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
    }
}
// ============================================
// ATUALIZAR VISUALIZAÇÃO DAS CONFIGURAÇÕES
// ============================================
function atualizarVisualizacaoConfiguracoes() {
    const configTags = document.getElementById('configTags');
    if (!configTags) {
        console.warn('⚠️ configTags não encontrado');
        return;
    }
    
    try {
        // Usar a função getFiltrosAtivos do loterias.js
        if (typeof window.getFiltrosAtivos !== 'function') {
            configTags.innerHTML = '<span class="filtro-item">⚙️ Aguardando configurações...</span>';
            return;
        }
        
        const filtros = window.getFiltrosAtivos();
        
        if (!filtros || filtros.length === 0) {
            configTags.innerHTML = '<span class="filtro-item">⚙️ Nenhuma configuração ativa</span>';
            return;
        }
        
        // Renderizar os filtros
        configTags.innerHTML = filtros.map(f => 
            `<span class="filtro-item">${f.label}: <strong>${f.valor}</strong></span>`
        ).join('');
        
        // Mostrar o container de visualização
        const configVisualizacao = document.getElementById('configVisualizacao');
        if (configVisualizacao) {
            configVisualizacao.style.display = 'block';
        }
        
        console.log('✅ Configurações atualizadas:', filtros.length, 'filtros');
        
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        configTags.innerHTML = '<span class="filtro-item">⚠️ Erro ao carregar configurações</span>';
    }
}



// ============================================
// 🔥 DESLOGAR
// ============================================
function deslogar() {
    firebase.auth().signOut().then(() => {
        window.usuarioAtual = null;
        window.creditosUsuario = 0;
        window.isUserPro = false;
        window.proExpiresAt = null;
        window.proDaysLeft = 0;
        atualizarInterfaceUsuario();
        window.mostrarToast('👋 Deslogado com sucesso!', 'success');
    }).catch((error) => {
        console.error('❌ Erro ao deslogar:', error);
        window.mostrarToast('Erro ao deslogar', 'error');
    });
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================

window.atualizarInterfaceUsuario = atualizarInterfaceUsuario;
window.buscarCreditosAPI = buscarCreditosAPI;
window.atualizarInterfaceJogo = atualizarInterfaceJogo;
window.carregarDadosUsuario = carregarDadosUsuario;
window.atualizarVisualizacaoConfiguracoes = atualizarVisualizacaoConfiguracoes;
window.deslogar = deslogar;

console.log('✅ USER-INTERFACE.js carregado (V2.1 - Nome corrigido)');
