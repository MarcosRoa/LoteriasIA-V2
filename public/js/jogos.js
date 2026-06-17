// js/jogos.js - VERSÃO 2.0
// ============================================

// js/jogos.js - Geração de jogos (V2.0)
// ============================================
// JOGOS.js - Geração de palpites (VERSÃO COMPLETA CORRIGIDA) 16/06/2026
// ============================================

// ============================================
// JOGOS.js - Geração de palpites (VERSÃO COMPLETA CORRIGIDA)
// ============================================

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

// ============================================
// FUNÇÃO AUXILIAR - NOME DO MÊS
// ============================================
function getNomeMes(numero) {
    const meses = ['', 'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 
                   'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
    return meses[numero] || numero;
}

// ============================================
// FUNÇÃO PRINCIPAL - GERAR JOGOS
// ============================================
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
            dados: window.dadosAtuais(),
            dadosExtras: window.dadosExtrasAtuais(),
            filters: {
                periodo: periodo,
                dispersao: dispersao
            }
        });
        
        if (result.creditsRemaining !== undefined && result.creditsRemaining !== null) {
            window.creditosUsuario = result.creditsRemaining;
        }
        
        // ============================================
        // RENDERIZAR RESULTADOS
        // ============================================
        if (resultadosDiv && result.games) {
            const isLoteca = loteria === 'loteca';
            const isDiaDeSorte = loteria === 'diadesorte';
            
            let html = `
                <div class="resultados-container">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 16px;">
                        <h4>🎲 ${result.games.length} JOGO(S) GERADO(S)</h4>
                        <span style="font-size: 14px; color: var(--text-secondary);">
                            🎯 Modo: ${modo.replace('_', ' ').toUpperCase()}
                            ${result.confiancaMedia ? `| 📊 Confiança média: ${result.confiancaMedia}%` : ''}
                        </span>
                    </div>
                    <div class="jogos-grid" style="display: flex; flex-direction: column; gap: 12px;">
            `;
            
            result.games.forEach((jogo, idx) => {
                const numeros = jogo.numeros || jogo;
                const timeCoracao = jogo.timeCoracao || null;
                const mesSorte = jogo.mesSorte || null;
                const confianca = jogo.confianca ?? null;
                
                html += `
                    <div style="background: var(--bg-card); padding: 14px; border-radius: 12px; border-left: 4px solid ${isLoteca ? '#10b981' : isDiaDeSorte ? '#f59e0b' : '#8b5cf6'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
                            <div style="font-weight: bold; font-size: 14px;">Jogo ${idx + 1}</div>
                            ${confianca !== null ? `<span style="font-size: 12px; color: ${confianca > 70 ? '#10b981' : confianca > 40 ? '#f59e0b' : '#ef4444'};">🎯 Confiança: ${confianca}%</span>` : ''}
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${numeros.map(n => `
                                <span style="background: linear-gradient(135deg, ${isDiaDeSorte ? '#f59e0b' : '#8b5cf6'}, ${isDiaDeSorte ? '#eab308' : '#06b6d4'}); padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 14px; min-width: 32px; text-align: center;">
                                    ${String(n).padStart(2, '0')}
                                </span>
                            `).join('')}
                        </div>
                        ${mesSorte ? `
                            <div style="margin-top: 10px; padding: 8px 12px; background: rgba(251, 191, 36, 0.15); border-radius: 8px; border-left: 3px solid #fbbf24;">
                                🎁 <strong>Mês da Sorte:</strong> <span style="color: #fbbf24; font-weight: bold;">${mesSorte} - ${getNomeMes(mesSorte)}</span>
                            </div>
                        ` : ''}
                        ${timeCoracao ? `
                            <div style="margin-top: 10px; padding: 8px 12px; background: rgba(251, 191, 36, 0.15); border-radius: 8px; border-left: 3px solid #fbbf24;">
                                ⚽ <strong>Time do Coração:</strong> <span style="color: #fbbf24; font-weight: bold;">${timeCoracao}</span>
                            </div>
                        ` : ''}
                        ${isLoteca ? `
                            <div style="margin-top: 8px; font-size: 11px; color: var(--text-secondary);">
                                📊 14 jogos • Valores: 0=Empate, 1=Coluna 1, 2=Coluna 2
                            </div>
                        ` : ''}
                        ${isDiaDeSorte ? `
                            <div style="margin-top: 8px; font-size: 11px; color: var(--text-secondary);">
                                📊 7 números + 1 mês da sorte
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            const creditsSpent = result.creditsSpent ?? 0;
            const creditsRemaining = result.creditsRemaining ?? 0;
            
            html += `
                    </div>
                    <div class="resultados-footer" style="margin-top: 16px; padding: 12px; background: rgba(56,189,248,0.1); border-radius: 12px; display: flex; justify-content: space-between; flex-wrap: wrap;">
                        <p>💰 Créditos gastos: R$ ${creditsSpent}</p>
                        <p>💰 Saldo restante: R$ ${creditsRemaining}</p>
                        ${result.confiancaMedia ? `<p>📊 Confiança média: ${result.confiancaMedia}%</p>` : ''}
                    </div>
                </div>
            `;
            
            resultadosDiv.innerHTML = html;
        }
        
        const saldoMsg = window.creditosUsuario !== undefined && window.creditosUsuario !== null 
            ? `R$ ${window.creditosUsuario}` 
            : 'indisponível';
        
        window.mostrarToast(`${qtd} jogo(s) gerado(s) com IA! Saldo: ${saldoMsg}`, 'success');
        
        if (typeof window.atualizarInterfaceUsuario === 'function') {
            window.atualizarInterfaceUsuario();
        }
        
    } catch (error) {
        console.error('Erro na API:', error);
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `
                <div class="mensagem-erro">
                    ❌ Erro ao gerar jogos: ${error.error || error.message || 'Tente novamente'}
                </div>
            `;
        }
        if (error.status === 402) {
            window.mostrarToast('Saldo insuficiente! Compre créditos.', 'error');
            window.abrirModalComprar();
        } else {
            window.mostrarToast('Erro ao gerar jogos. Tente novamente.', 'error');
        }
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================
window.gerarJogos = gerarJogos;
window.validarSaldoEAcesso = validarSaldoEAcesso;
window.getNomeMes = getNomeMes;

console.log('✅ JOGOS.js carregado (VERSÃO COMPLETA CORRIGIDA)');
