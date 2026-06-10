// js/jogos.js - VERSÃO 2.0
// ============================================

// Função de validação de saldo
function validarSaldoEAcesso(qtd, valorTotal) {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return { valido: false };
    }
    
    if (window.creditosUsuario === undefined || window.creditosUsuario === null) {
        window.mostrarToast('Erro ao verificar créditos. Recarregue a página.', 'error');
        return { valido: false };
    }
    
    if (window.creditosUsuario < valorTotal) {
        window.mostrarToast(`Saldo insuficiente! Necessário: R$ ${valorTotal} | Disponível: R$ ${window.creditosUsuario}`, 'error');
        window.abrirModalComprar();
        return { valido: false };
    }
    
    return { valido: true };
}

// Função principal de geração
async function gerarJogos() {
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    const qtd = parseInt(document.getElementById('qtdJogos')?.value || 1);
    const valorTotal = qtd * 3;
    const validacao = validarSaldoEAcesso(qtd, valorTotal);
    if (!validacao.valido) return;
    
    const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
    const modo = document.getElementById('modoGeracao')?.value || 'ia_especialista';
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
    
    // Mostrar loading
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) {
        resultadosDiv.innerHTML = '<div class="loading">🎲 Gerando jogos... 🎲</div>';
    }
    
    try {
        const result = await window.apiClient.generateGames({
            lottery: loteria,
            quantity: qtd,
            mode: modo,
            extraNumbers: quantidadeNumerosJogo
        });
        
        if (result.creditsRemaining !== undefined) {
            window.creditosUsuario = result.creditsRemaining;
        }
        
        // Renderizar resultados
        if (resultadosDiv && result.games) {
            resultadosDiv.innerHTML = `
                <div class="resultados-container">
                    <h4>🎲 ${result.games.length} JOGO(S) GERADO(S) 🎲</h4>
                    <div class="jogos-grid">
                        ${result.games.map((jogo, idx) => `
                            <div class="jogo-card">
                                <div class="jogo-numero">Jogo ${idx + 1}</div>
                                <div class="jogo-numeros">${jogo.map(n => String(n).padStart(2, '0')).join(' - ')}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="resultados-footer">
                        <p>💰 Créditos gastos: R$ ${result.creditsSpent}</p>
                        <p>💰 Saldo restante: R$ ${result.creditsRemaining}</p>
                    </div>
                </div>
            `;
        }
        
        window.mostrarToast(`${qtd} jogo(s) gerado(s)! Saldo: R$ ${window.creditosUsuario}`, 'success');
        
        // Atualizar interface
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            window.atualizarInterfaceUsuario();
        }
        
    } catch (error) {
        console.error('Erro na API:', error);
        
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `<div class="mensagem-erro">❌ Erro ao gerar jogos: ${error.error || error.message}</div>`;
        }
        
        if (error.status === 402) {
            window.mostrarToast('Saldo insuficiente! Compre créditos.', 'error');
            window.abrirModalComprar();
        } else {
            window.mostrarToast('Erro ao gerar jogos. Tente novamente.', 'error');
        }
    }
}

// Exportar
window.gerarJogos = gerarJogos;
window.validarSaldoEAcesso = validarSaldoEAcesso;

console.log('✅ JOGOS.js atualizado (V2.0)');
