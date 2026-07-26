// ============================================
// perfil.js - PÁGINA DE PERFIL (VERSÃO COMPLETA)
// ============================================

// ============================================
// 0. INICIALIZAR FIREBASE (JÁ ESTÁ NO HTML)
// ============================================

// ============================================
// 1. CONFIGURAÇÃO INICIAL
// ============================================
const CONFIG = {
    APP_NAME: 'Loterias IA',
    VERSION: '6.1',
    DIAS_PRO: 30,
    DIAS_FREE: 10
};

// ============================================
// 2. VARIÁVEIS GLOBAIS
// ============================================
let usuario = null;
let creditos = 0;
let isUserPro = false;
let proExpiresAt = null;
let jogosSelecionados = new Set();
let exportandoPDF = false;

// ============================================
// 3. FUNÇÕES AUXILIARES
// ============================================
function formatarNumeroZero(numero) {
    return numero.toString().padStart(2, '0');
}

function getNomeMes(numero) {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return meses[numero-1] || 'Desconhecido';
}

function mascararConfiguracoes(texto) {
    if (!texto) return '••••••';
    return '•'.repeat(Math.min(texto.length, 40));
}

function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ============================================
// 4. INICIALIZAÇÃO
// ============================================
async function initPerfil() {
    try {
        console.log('🚀 Carregando perfil...');
        
        const user = await getCurrentUser();
        if (!user) {
            renderizarLogin();
            return;
        }
        
        usuario = user;
        await carregarDadosUsuario(usuario.uid);
        await renderizarPerfil();
        
        console.log('✅ Perfil carregado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao carregar perfil:', error);
        mostrarToast('Erro ao carregar perfil. Tente novamente.', 'error');
        renderizarErro(error.message);
    }
}

// ============================================
// 5. AUTENTICAÇÃO
// ============================================
function getCurrentUser() {
    return new Promise((resolve) => {
        const auth = firebase.auth();
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                resolve({
                    uid: user.uid,
                    nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
                    email: user.email,
                    foto: user.photoURL,
                    token: await user.getIdToken()
                });
            } else {
                resolve(null);
            }
        });
    });
}

// ============================================
// 6. BUSCAR DADOS DO USUÁRIO
// ============================================
async function carregarDadosUsuario(uid) {
    try {
        const creditsResponse = await fetch(`/api/credits?uid=${uid}`);
        const creditsData = await creditsResponse.json();
        creditos = creditsData.credits || 0;
        isUserPro = creditsData.isPro || false;
        
        const proResponse = await fetch(`/api/pro/status?uid=${uid}`);
        const proData = await proResponse.json();
        proExpiresAt = proData.proExpiresAt || null;
        isUserPro = proData.isPro || isUserPro;
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        throw error;
    }
}

// ============================================
// 7. RENDERIZAR PERFIL
// ============================================
async function renderizarPerfil() {
    const dias = isUserPro ? CONFIG.DIAS_PRO : CONFIG.DIAS_FREE;
    
    try {
        const historicoResponse = await fetch(`/api/user/history?uid=${usuario.uid}&limit=50`);
        const historico = await historicoResponse.json();
        
        const transacoesResponse = await fetch(`/api/user/transactions?uid=${usuario.uid}&dias=${dias}`);
        const transacoes = await transacoesResponse.json();
        
        const app = document.getElementById('app');
        app.innerHTML = criarHTML(usuario, creditos, isUserPro, proExpiresAt, historico.history || [], transacoes.transactions || [], dias);
        
        atualizarEventos();
        
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        renderizarErro('Erro ao carregar histórico');
    }
}

// ============================================
// 8. CRIAR HTML DO PERFIL
// ============================================
function criarHTML(user, credits, isPro, expiresAt, historico, transacoes, dias) {
    const avatarHtml = user.foto ? `<img src="${user.foto}" alt="Avatar" class="avatar-img">` : '👤';
    const proBadge = isPro ? '<span class="pro-badge">⭐ PRO</span>' : '<span class="free-badge">🔓 Grátis</span>';
    const proExpires = isPro && expiresAt ? `<div class="pro-expires">✨ Válido até ${new Date(expiresAt).toLocaleDateString()}</div>` : '';
    
    let totalJogos = 0;
    historico.forEach(item => {
        const jogosArray = item.jogos || [];
        totalJogos += jogosArray.length;
    });
    
    return `
        <!-- HEADER -->
        <div class="header">
            <div class="header-content">
                <div class="header-logo">
                    <img src="BrasãoRoa Imagem.png" onerror="this.style.display='none'" alt="Logo">
                </div>
                <div class="header-text">
                    <h1>🧠 Loterias V.6.1 <span class="version-badge">MEU PERFIL</span></h1>
                    <p class="header-subtitle">10 loterias • IA que Aprende Padrões • Login Social • Sistema de Créditos • PIX</p>
                </div>
                <div class="header-actions">
                    <button class="btn-voltar" onclick="window.location.href='index.html'">← Voltar</button>
                </div>
            </div>
        </div>

        <!-- CONTEÚDO PRINCIPAL -->
        <div class="container">
            <div class="profile-grid">
                <!-- Card: Perfil -->
                <div class="card card-full">
                    <div class="perfil-header">
                        <div class="avatar">${avatarHtml}</div>
                        <div class="info">
                            <h2>${user.nome || 'Usuário'} ${proBadge}</h2>
                            ${proExpires}
                            <p>${user.email || 'Email não disponível'}</p>
                            <p style="font-size: 12px; color: #94a3b8;">📅 Histórico: Últimos ${dias} dias</p>
                        </div>
                    </div>
                </div>

                <!-- Card: Saldo -->
                <div class="card">
                    <div class="card-title">💰 SALDO</div>
                    <div class="saldo-card">
                        <strong>R$ ${credits}</strong>
                    </div>
                </div>

                <!-- Card: Estatísticas -->
                <div class="card">
                    <div class="card-title">📊 ESTATÍSTICAS</div>
                    <div class="stats-container">
                        <div class="stats-number">${totalJogos}</div>
                        <div class="stats-label">Palpites gerados</div>
                        <hr class="stats-divider">
                        <div class="stats-number" style="color: #f59e0b;">${transacoes.filter(t => t.tipo === 'compra').length}</div>
                        <div class="stats-label">Compras realizadas</div>
                    </div>
                </div>

                <!-- Card: Histórico de Palpites -->
                <div class="card">
                    <div class="card-title">
                        <span>📜 PALPITES</span>
                        <div class="historico-actions">
                            <span id="contadorSelecionados" style="font-size: 11px; color: #94a3b8;">0 selecionado(s)</span>
                            <button class="btn-selecionar-todos" onclick="window.selecionarTodos()">Selecionar Todos</button>
                            ${isPro ? 
                                `<button class="btn-exportar-pdf" onclick="window.exportarSelecionadosPDF()">📄 Exportar PDF</button>` :
                                `<button class="btn-exportar-pdf btn-exportar-pdf-bloqueado" onclick="window.mostrarToast('⭐ Esta funcionalidade é exclusiva para PRO!', 'warning')">🔒 Exportar PDF (PRO)</button>`
                            }
                        </div>
                    </div>
                    <div class="historico-container">
                        ${historico.length === 0 ? 
                            '<div class="empty-message">Nenhum palpite gerado nos últimos dias.</div>' :
                            renderizarHistorico(historico)
                        }
                    </div>
                </div>

                <!-- Card: Transações -->
                <div class="card">
                    <div class="card-title">💳 TRANSAÇÕES</div>
                    <div class="transacoes-container">
                        ${transacoes.length === 0 ?
                            '<div class="empty-message">Nenhuma transação encontrada.</div>' :
                            renderizarTransacoes(transacoes)
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p>© 2026 Loterias IA - Todas as informações são de caráter informativo e não garantem ganhos.</p>
        </div>
    `;
}

// ============================================
// 9. RENDERIZAR HISTÓRICO (CORRIGIDO - JOGOS COMPLETOS)
// ============================================
function renderizarHistorico(historico) {
    let html = '<div class="historico-grid">';
    let itemIdx = 0;
    
    historico.forEach((item) => {
        // 🔥 EXTRAIR JOGOS CORRETAMENTE
        let jogosArray = item.jogos || [];
        let jogosParaRenderizar = [];

        // ✅ VERIFICA SE É UM ARRAY DE JOGOS OU UM ÚNICO JOGO
        if (Array.isArray(jogosArray) && jogosArray.length > 0) {
            // Se o primeiro elemento é um array → múltiplos jogos
            if (Array.isArray(jogosArray[0])) {
                jogosParaRenderizar = jogosArray;
            } else {
                // Caso contrário → um único jogo
                jogosParaRenderizar = [jogosArray];
            }
        }

        const dataJogo = item.data ? new Date(item.data).toLocaleString('pt-BR') : 'Data desconhecida';

        // ✅ RENDERIZAR CADA JOGO COMPLETO
        jogosParaRenderizar.forEach((jogo, jogoIdx) => {
            const id = `${itemIdx}_${jogoIdx}`;
            const numerosDisplay = Array.isArray(jogo) ? jogo.join(' - ') : jogo;

            // 🔥 EXTRAS
            let extrasDisplay = '';

            // Timemania: times
            if (item.times && Array.isArray(item.times) && item.times.length > 0) {
                extrasDisplay += `<div class="historico-extra">⚽ Time: <strong>${item.times[0]}</strong></div>`;
            }

            // Dia de Sorte: meses
            if (item.meses && Array.isArray(item.meses) && item.meses.length > 0) {
                const mesNomeDisplay = getNomeMes(item.meses[0]);
                extrasDisplay += `<div class="historico-extra">📅 Mês: <strong>${mesNomeDisplay}</strong></div>`;
            }

            // +Milionária: trevos
            if (item.extras && typeof item.extras === 'object' && item.extras.trevos) {
                const trevosDisplay = item.extras.trevos.join(' - ');
                extrasDisplay += `<div class="historico-extra">🍀 Trevos: <strong>${trevosDisplay}</strong></div>`;
            }

            // Configurações
            let configDisplay = '';
            const filtrosTexto = item.filtros || '';
            if (filtrosTexto) {
                configDisplay = `<div class="config-texto">⚙️ ${isUserPro ? filtrosTexto : mascararConfiguracoes(filtrosTexto)}</div>`;
            }

            // BOLÃO
            let bolaoDisplay = '';
            const quantidadeNumeros = item.quantidade_numeros || 0;
            const jogoSimples = window.LOTERIAS?.[item.loteria?.toLowerCase()?.replace(/[^a-z]/g, '')]?.jogoSimples || 6;
            if (quantidadeNumeros > jogoSimples) {
                bolaoDisplay = `<div class="bolao-info">⭐ BOLÃO: ${quantidadeNumeros} números</div>`;
            }

            // ✅ HTML DO JOGO (COMPLETO)
            html += `
                <div class="historico-item" id="historico-item-${id}">
                    <div class="historico-header">
                        <span class="historico-loteria">🎲 ${item.loteria || 'Loteria'} - Jogo ${jogoIdx + 1}</span>
                        <span class="historico-data">📅 ${dataJogo}</span>
                    </div>
                    <div class="historico-jogos">
                        📊 Números: <strong>${numerosDisplay}</strong>
                    </div>
                    ${extrasDisplay}
                    ${bolaoDisplay}
                    ${configDisplay}
                    <div class="historico-selecao">
                        <label class="checkbox-label">
                            <input type="checkbox" class="selecionar-jogo" data-id="${id}" onchange="window.toggleSelecao('${id}')">
                            Selecionar para PDF
                        </label>
                    </div>
                </div>
            `;
            itemIdx++;
        });
    });

    html += '</div>';
    return html;
}

// ============================================
// 10. RENDERIZAR TRANSAÇÕES
// ============================================
function renderizarTransacoes(transacoes) {
    let html = `
        <table class="transacoes-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    transacoes.forEach(t => {
        const tipoLabel = {
            'compra': '💰 Compra',
            'uso': '🎲 Jogos',
            'pix_simulado': '💳 Teste',
            'pro_ativacao': '⭐ PRO',
            'reserva': '🔒 Reserva',
            'estorno': '↩️ Estorno'
        }[t.tipo] || t.tipo || '-';
        
        const valor = t.tipo === 'uso' || t.tipo === 'reserva' ? 
            `<span class="debito">- R$ ${t.quantidade || 0}</span>` : 
            `<span class="credito">+ R$ ${t.quantidade || 0}</span>`;
        
        html += `
            <tr>
                <td>${t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '-'}</td>
                <td>${tipoLabel}</td>
                <td>${valor}</td>
                <td>R$ ${t.saldo_apos || 0}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    return html;
}

// ============================================
// 11. FUNÇÕES DE SELEÇÃO E EXPORTAÇÃO
// ============================================
window.toggleSelecao = function(id) {
    if (jogosSelecionados.has(id)) {
        jogosSelecionados.delete(id);
    } else {
        jogosSelecionados.add(id);
    }
    atualizarContadorSelecionados();
};

window.selecionarTodos = function() {
    document.querySelectorAll('.selecionar-jogo').forEach(cb => {
        cb.checked = true;
        jogosSelecionados.add(cb.dataset.id);
    });
    atualizarContadorSelecionados();
    mostrarToast(`${jogosSelecionados.size} palpites selecionados!`, 'success');
};

function atualizarContadorSelecionados() {
    const contador = document.getElementById('contadorSelecionados');
    if (contador) {
        contador.textContent = `${jogosSelecionados.size} selecionado(s)`;
    }
}

// ============================================
// 12. EXPORTAÇÃO PDF (EXCLUSIVO PRO)
// ============================================
window.exportarSelecionadosPDF = async function() {
    if (!isUserPro) {
        mostrarToast('⭐ Esta funcionalidade é exclusiva para usuários PRO!', 'warning');
        return;
    }
    
    if (exportandoPDF) return;
    exportandoPDF = true;
    
    try {
        const checkboxes = document.querySelectorAll('.selecionar-jogo:checked');
        if (checkboxes.length === 0) {
            alert('Nenhum palpite selecionado!');
            exportandoPDF = false;
            return;
        }
        
        const palpites = [];
        checkboxes.forEach((checkbox) => {
            const item = checkbox.closest('.historico-item');
            if (item) {
                const loteriaElem = item.querySelector('.historico-loteria');
                const numerosElem = item.querySelector('.historico-jogos');
                const dataElem = item.querySelector('.historico-data');
                const configElem = item.querySelector('.config-texto');
                const bolaoElem = item.querySelector('.bolao-info');
                const extraElem = item.querySelector('.historico-extra');
                
                let numerosTexto = numerosElem ? numerosElem.innerText.replace(/[📊🎲💰📜✨📅📌]/g, '').replace('Números:', '').trim() : '';
                let loteriaTexto = loteriaElem ? loteriaElem.innerText.replace(/[🎲]/g, '').trim() : 'Loteria';
                let dataTexto = dataElem ? dataElem.innerText.replace(/[📅]/g, '').trim() : '';
                let configTexto = configElem ? configElem.innerText : '';
                let bolaoTexto = bolaoElem ? bolaoElem.innerText : '';
                let extraTexto = extraElem ? extraElem.innerText : '';
                
                palpites.push({
                    loteria: loteriaTexto,
                    numeros: numerosTexto,
                    data: dataTexto,
                    config: configTexto,
                    bolao: bolaoTexto,
                    extra: extraTexto
                });
            }
        });
        
        await gerarPDF(palpites);
        mostrarToast(`${palpites.length} palpites exportados com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Erro ao gerar PDF: ' + error.message);
    } finally {
        exportandoPDF = false;
    }
};

async function gerarPDF(palpites) {
    const divPDF = document.createElement('div');
    divPDF.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:800px;padding:30px;background:white;font-family:Arial,sans-serif;';
    
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR') + ' às ' + dataAtual.toLocaleTimeString('pt-BR');
    
    let palpitesHTML = '';
    palpites.forEach((p, idx) => {
        const numerosArray = p.numeros.split(',').map(n => n.trim());
        palpitesHTML += `
            <div style="margin-bottom:20px;padding:12px;border-left:4px solid #8b5cf6;background:#f8fafc;border-radius:8px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-weight:bold;font-size:13px;">${idx+1}. ${p.loteria}</span>
                    <span style="font-size:9px;color:#666;">${p.data || 'Data não informada'}</span>
                </div>
                <div style="font-size:12px;color:#3b82f6;margin-top:5px;">
                    Números: ${numerosArray.map(n => `<strong>${n}</strong>`).join(' • ')}
                </div>
                ${p.extra ? `<div style="font-size:11px;color:#f59e0b;margin-top:5px;">${p.extra}</div>` : ''}
                ${p.bolao ? `<div style="font-size:10px;color:#f59e0b;margin-top:5px;">⭐ ${p.bolao}</div>` : ''}
                ${p.config ? `<div style="font-size:9px;color:#888;margin-top:8px;border-top:1px solid #eee;padding-top:5px;">⚙️ ${p.config}</div>` : ''}
            </div>
        `;
    });
    
    divPDF.innerHTML = `
        <div>
            <div style="text-align:center;border-bottom:3px solid #8b5cf6;padding-bottom:20px;margin-bottom:25px;">
                <h1 style="font-size:28px;color:#8b5cf6;margin:0;">LOTERIAS IA</h1>
                <p style="font-size:11px;color:#666;">Sistema Profissional de Loterias com IA</p>
                <p style="font-size:10px;color:#999;">Versão ${CONFIG.VERSION} PRO</p>
            </div>
            <div style="background:linear-gradient(135deg,#f8fafc,#e2e8f0);border:2px solid #8b5cf6;padding:18px;border-radius:14px;margin-bottom:25px;">
                <div style="display:flex;align-items:center;gap:15px;margin-bottom:15px;">
                    <div style="width:60px;height:60px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;overflow:hidden;">
                        ${usuario.foto ? `<img src="${usuario.foto}" style="width:100%;height:100%;object-fit:cover;">` : '👤'}
                    </div>
                    <div>
                        <div style="font-size:20px;font-weight:bold;color:#111827;">${usuario.nome || 'Usuário'}</div>
                        <div style="font-size:12px;color:#374151;">${usuario.email || 'Email não informado'}</div>
                        ${isUserPro ? `<div style="font-size:11px;color:#f59e0b;margin-top:4px;">⭐ Plano PRO</div>` : ''}
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px;color:#334155;">
                    <div><strong>Data da Exportação:</strong><br>${dataFormatada}</div>
                    <div><strong>Total de Palpites:</strong><br>${palpites.length}</div>
                    <div><strong>Sistema:</strong><br>Loterias IA V${CONFIG.VERSION} PRO</div>
                    <div><strong>Status:</strong><br>${isUserPro ? '⭐ Plano PRO Ativo' : '🔓 Plano Grátis'}</div>
                </div>
            </div>
            <h3 style="color:#8b5cf6;font-size:16px;margin-bottom:15px;">📜 PALPITES SELECIONADOS</h3>
            ${palpitesHTML}
            <div style="text-align:center;margin-top:30px;padding-top:15px;border-top:1px solid #ccc;font-size:8px;color:#999;">
                Documento gerado por Loterias IA - ${dataFormatada}
            </div>
        </div>
    `;
    
    document.body.appendChild(divPDF);
    await new Promise(r => setTimeout(r, 100));
    
    const canvas = await html2canvas(divPDF, {
        scale: 2.5,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
    });
    
    document.body.removeChild(divPDF);
    
    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    let heightLeft = imgHeight;
    let position = 0;
    while (heightLeft > pageHeight) {
        position = heightLeft - pageHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }
    
    doc.save(`palpites_loterias_ia_${Date.now()}.pdf`);
}

// ============================================
// 13. RENDERIZAR ERRO
// ============================================
function renderizarErro(mensagem) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="header">
            <div class="header-content">
                <div class="header-text">
                    <h1>🧠 Loterias V.6.1</h1>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="error-container">
                <h2>❌ Erro ao carregar perfil</h2>
                <p>${mensagem}</p>
                <button onclick="window.location.href='index.html'">Voltar ao Sistema</button>
            </div>
        </div>
    `;
}

function renderizarLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="header">
            <div class="header-content">
                <div class="header-text">
                    <h1>🧠 Loterias V.6.1</h1>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="login-container">
                <h2>🔐 Você não está logado!</h2>
                <p>Faça login no sistema para acessar seu perfil.</p>
                <button onclick="window.location.href='index.html'" class="btn-primary">Ir para o sistema</button>
            </div>
        </div>
    `;
}

// ============================================
// 14. ATUALIZAR EVENTOS
// ============================================
function atualizarEventos() {
    document.querySelectorAll('.selecionar-jogo').forEach(cb => {
        cb.addEventListener('change', function() {
            window.toggleSelecao(this.dataset.id);
        });
    });
}

// ============================================
// 15. INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', initPerfil);

window.mostrarToast = mostrarToast;
window.toggleSelecao = toggleSelecao;
window.selecionarTodos = selecionarTodos;
window.exportarSelecionadosPDF = exportarSelecionadosPDF;
