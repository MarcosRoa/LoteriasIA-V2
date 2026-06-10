// js/jogos.js - VERSÃO 2.0
// ============================================

// js/jogos.js - Geração de jogos (V2.0)
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
    
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) resultadosDiv.innerHTML = '<div class="loading">🎲 Gerando jogos...</div>';
    
    try {
        const result = await window.apiClient.generateGames({
            lottery: loteria,
            quantity: qtd,
            mode: modo,
            extraNumbers: quantidadeNumerosJogo
        });
        
        if (result.creditsRemaining !== undefined) window.creditosUsuario = result.creditsRemaining;
        
        if (resultadosDiv && result.games) {
            resultadosDiv.innerHTML = `
                <div class="resultados-container">
                    <h4>🎲 ${result.games.length} JOGO(S) GERADO(S)</h4>
                    <div class="jogos-grid" style="display: flex; flex-direction: column; gap: 12px;">
                        ${result.games.map((jogo, idx) => `
                            <div style="background: var(--bg-card); padding: 12px; border-radius: 12px;">
                                <div style="font-weight: bold; margin-bottom: 8px;">Jogo ${idx + 1}</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    ${jogo.map(n => `<span style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); padding: 6px 12px; border-radius: 8px; font-weight: bold;">${String(n).padStart(2, '0')}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="resultados-footer" style="margin-top: 16px; padding: 12px; background: rgba(56,189,248,0.1); border-radius: 12px;">
                        <p>💰 Créditos gastos: R$ ${result.creditsSpent}</p>
                        <p>💰 Saldo restante: R$ ${result.creditsRemaining}</p>
                    </div>
                </div>
            `;
        }
        
        window.mostrarToast(`${qtd} jogo(s) gerado(s)! Saldo: R$ ${window.creditosUsuario}`, 'success');
        
        if (typeof window.atualizarInterfaceUsuario === 'function') window.atualizarInterfaceUsuario();
        
    } catch (error) {
        console.error('Erro na API:', error);
        if (resultadosDiv) resultadosDiv.innerHTML = `<div class="mensagem-erro">❌ Erro ao gerar jogos: ${error.error || error.message}</div>`;
        if (error.status === 402) {
            window.mostrarToast('Saldo insuficiente! Compre créditos.', 'error');
            window.abrirModalComprar();
        } else {
            window.mostrarToast('Erro ao gerar jogos. Tente novamente.', 'error');
        }
    }
}

window.gerarJogos = gerarJogos;
window.validarSaldoEAcesso = validarSaldoEAcesso;

console.log('✅ JOGOS.js carregado (V2.0)');
