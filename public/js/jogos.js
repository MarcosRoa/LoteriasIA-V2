// js/jogos.js - VERSÃO 2.2 (DEFINITIVA E CORRIGIDA) 10/07/2026
// ============================================

// ============================================
// FUNÇÃO PARA VALIDAR SALDO E ACESSO
// ============================================
function validarSaldoEAcesso(qtd, valorTotal) {
    // Verifica se o usuário está logado
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return { valido: false };
    }
    
    // Verifica se os créditos foram carregados
    if (window.creditosUsuario === undefined || window.creditosUsuario === null) {
        window.mostrarToast('Erro ao verificar créditos. Recarregue a página.', 'error');
        return { valido: false };
    }
    
    // Verifica se o saldo é suficiente
    if (window.creditosUsuario < valorTotal) {
        window.mostrarToast(`Saldo insuficiente! Necessário: R$ ${valorTotal} | Disponível: R$ ${window.creditosUsuario}`, 'error');
        window.abrirModalComprar();
        return { valido: false };
    }
    
    return { valido: true };
}

// ============================================
// FUNÇÃO PARA PEGAR NOME DO MÊS
// ============================================
function getNomeMes(mes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1] || mes;
}

// ============================================
// FUNÇÃO PRINCIPAL: GERAR JOGOS
// ============================================
async function gerarJogos() {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    const qtd = parseInt(document.getElementById('qtdJogos')?.value || 1);
    const valorTotal = qtd * 3;
    
    // 🔥 CHAMA A FUNÇÃO VALIDAR SALDO
    const validacao = validarSaldoEAcesso(qtd, valorTotal);
    if (!validacao.valido) return;
    
    const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
    
    // ============================================
    // 🔥 PEGAR IA SELECIONADA DOS BOTÕES
    // ============================================
    const modo = window.getIAAtual ? window.getIAAtual() : 'hybrid';
    
    const config = window.LOTERIAS[loteria];
    
    const modoBolaoAtivo = document.getElementById('modoBolaoCheckbox')?.checked || false;
    let quantidadeNumerosJogo = config.jogoSimples;
    
    if (modoBolaoAtivo && config.permiteBolao) {
        if (!window.isUserPro) {
            window.mostrarToast('⭐ Modo Bolão é exclusivo para PRO!', 'warning');
            return;
        }
        quantidadeNumerosJogo = parseInt(document.getElementById('qtdNumerosBolao')?.value || config.jogoSimples);
    }
    
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) resultadosDiv.innerHTML = '<div class="loading">🎲 Gerando jogos com IA...</div>';
    
    try {
        // Obter filtros atuais
        const periodo = window.periodoSelecionado ? window.periodoSelecionado() : 'all';
        const dispersao = window.dispersaoAtual ? window.dispersaoAtual() : 15;
        
        // Chamar a API com os parâmetros corretos
        const result = await window.apiClient.generateGames({
            lottery: loteria,
            quantity: qtd,
            mode: modo,
            extraNumbers: quantidadeNumerosJogo,
            dados: window.dadosAtuais ? window.dadosAtuais() : [],
            dadosExtras: window.dadosExtrasAtuais ? window.dadosExtrasAtuais() : [],
            filters: {
                periodo: periodo,
                dispersao: dispersao
            }
        });
        
        if (result.creditsRemaining !== undefined && result.creditsRemaining !== null) {
            window.creditosUsuario = result.creditsRemaining;
            // Atualizar interface
            const creditsDisplay = document.getElementById('creditosDisplay');
            if (creditsDisplay) {
                creditsDisplay.textContent = `R$ ${result.creditsRemaining}`;
            }
        }
        
        // ============================================
        // RENDERIZAR RESULTADOS
        // ============================================
        if (resultadosDiv && result.games) {
            let html = `<div style="margin-top: 20px;"><h3>🎯 ${result.games.length} Jogos Gerados</h3>`;
            html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;
            
            result.games.forEach((game, index) => {
                const numeros = Array.isArray(game) ? game : (game.numeros || []);
                html += `
                    <div style="background: #1e293b; border-radius: 8px; padding: 15px; border: 1px solid #334155;">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Jogo ${index + 1}</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${numeros.map(n => `<span style="background: #0f172a; padding: 4px 10px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #f59e0b;">${String(n).padStart(2, '0')}</span>`).join('')}
                        </div>
                        ${game.explicacao ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 8px;">${game.explicacao.join(' • ')}</div>` : ''}
                    </div>
                `;
            });
            
            html += `</div>`;
            html += `<div style="margin-top: 15px; font-size: 12px; color: #94a3b8; text-align: center;">`;
            html += `🧠 ${result.engineName || 'IA'} • Confiança: ${result.confidence || 0}%`;
            if (result.explanation) {
                html += `<br>${result.explanation.join(' • ')}`;
            }
            html += `</div></div>`;
            
            resultadosDiv.innerHTML = html;
        }
        
        window.mostrarToast(`${qtd} jogo(s) gerado(s) com IA ${modo}!`, 'success');
        
    } catch (error) {
        console.error('❌ Erro na API:', error);
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; padding: 15px; border-radius: 8px; text-align: center; color: #fca5a5;">
                    ⚠️ Erro ao gerar jogos: ${error.message || 'Erro desconhecido'}
                    <br><br>
                    <button onclick="window.gerarJogos()" style="background: #8b5cf6; border: none; padding: 8px 20px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">
                        🔄 Tentar novamente
                    </button>
                </div>
            `;
        }
        window.mostrarToast('Erro ao gerar jogos. Tente novamente.', 'error');
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.gerarJogos = gerarJogos;
window.validarSaldoEAcesso = validarSaldoEAcesso;
window.getNomeMes = getNomeMes;

console.log('✅ JOGOS.js carregado (VERSÃO 2.2 - DEFINITIVA)');
