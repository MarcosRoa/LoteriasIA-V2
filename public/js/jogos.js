// js/jogos.js - VERSÃO 2.3 (COMPLETA E CORRIGIDA) 10/07/2026
// ============================================

// ============================================
// VALIDAR SALDO E ACESSO
// ============================================

function validarSaldoEAcesso(qtd, valorTotal) {
    // 1. Verifica se usuário está logado
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return { valido: false, motivo: 'login' };
    }
    
    // 2. Verifica se créditos estão disponíveis
    if (window.creditosUsuario === undefined || window.creditosUsuario === null) {
        window.mostrarToast('⚠️ Erro ao verificar créditos. Recarregue a página.', 'error');
        return { valido: false, motivo: 'erro' };
    }
    
    // 3. Verifica se saldo é suficiente
    if (window.creditosUsuario < valorTotal) {
        window.mostrarToast(`❌ Saldo insuficiente! Necessário: R$ ${valorTotal} | Disponível: R$ ${window.creditosUsuario}`, 'error');
        // Abre modal para comprar créditos
        if (typeof window.abrirModalComprar === 'function') {
            window.abrirModalComprar();
        }
        return { valido: false, motivo: 'saldo' };
    }
    
    // 4. Tudo ok
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
    // 1. Verifica se usuário está logado
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    // 2. Obtém quantidade de jogos
    const qtd = parseInt(document.getElementById('qtdJogos')?.value || 1);
    
    // 3. Calcula custo (PRO = 2, FREE = 3)
    const custoPorJogo = window.isUserPro ? 2 : 3;
    const valorTotal = qtd * custoPorJogo;
    
    // 4. 🔥 VALIDA SALDO E ACESSO
    const validacao = validarSaldoEAcesso(qtd, valorTotal);
    if (!validacao.valido) return;
    
    // 5. Obtém loteria atual
    const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
    
    // 6. Obtém IA selecionada
    const modo = window.getIAAtual ? window.getIAAtual() : 'hybrid';
    
    const config = window.LOTERIAS[loteria];
    if (!config) {
        window.mostrarToast('Erro: Loteria não encontrada', 'error');
        return;
    }
    
    // 7. Verifica modo bolão
    const modoBolaoAtivo = document.getElementById('modoBolaoCheckbox')?.checked || false;
    let quantidadeNumerosJogo = config.jogoSimples;
    
    if (modoBolaoAtivo && config.permiteBolao) {
        if (!window.isUserPro) {
            window.mostrarToast('⭐ Modo Bolão é exclusivo para PRO!', 'warning');
            return;
        }
        quantidadeNumerosJogo = parseInt(document.getElementById('qtdNumerosBolao')?.value || config.jogoSimples);
    }
    
    // 8. Exibe loading
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) {
        resultadosDiv.innerHTML = '<div class="loading">🎲 Gerando jogos com IA...</div>';
    }
    
    try {
        // 9. Obtém filtros atuais
        const periodo = window.periodoSelecionado ? window.periodoSelecionado() : 'all';
        const dispersao = window.dispersaoAtual ? window.dispersaoAtual() : 15;
        
        // 10. Chama a API
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
        
        // 11. Atualiza créditos
        if (result.creditsRemaining !== undefined && result.creditsRemaining !== null) {
            window.creditosUsuario = result.creditsRemaining;
            const creditsDisplay = document.getElementById('creditosDisplay');
            if (creditsDisplay) {
                creditsDisplay.textContent = `R$ ${result.creditsRemaining}`;
            }
        }
        
        // 12. Renderiza resultados
        if (resultadosDiv && result.games) {
            let html = `
                <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; border-left: 4px solid #38bdf8;">
                    <h3 style="color: #38bdf8; margin: 0 0 5px 0;">🎯 ${result.games.length} Jogos Gerados</h3>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                        🧠 ${result.engineName || 'IA'} • Confiança: ${result.confidence || 0}%
                        ${result.explanation ? `<br>${result.explanation.join(' • ')}` : ''}
                    </p>
                </div>
            `;
            
            html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">`;
            
            result.games.forEach((game, index) => {
                const numeros = Array.isArray(game) ? game : (game.numeros || []);
                const isProGame = window.isUserPro ? '🔒' : '⭐';
                
                html += `
                    <div style="background: #1e293b; border-radius: 12px; padding: 15px; border: 1px solid #334155; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 11px; color: #94a3b8;">Jogo ${index + 1}</span>
                            <span style="font-size: 10px; color: #f59e0b;">${isProGame}</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${numeros.map(n => `
                                <span style="background: #0f172a; padding: 4px 10px; border-radius: 20px; font-size: 14px; font-weight: 600; color: #f59e0b; border: 1px solid #334155;">
                                    ${String(n).padStart(2, '0')}
                                </span>
                            `).join('')}
                        </div>
                        ${game.explicacao ? `
                            <div style="font-size: 9px; color: #64748b; margin-top: 8px; border-top: 1px solid #1e293b; padding-top: 8px;">
                                ${game.explicacao.join(' • ')}
                            </div>
                        ` : ''}
                        ${game.timeCoracao ? `
                            <div style="font-size: 10px; color: #ec4899; margin-top: 5px;">
                                ⚽ Time: ${game.timeCoracao}
                            </div>
                        ` : ''}
                        ${game.trevos ? `
                            <div style="font-size: 10px; color: #a855f7; margin-top: 5px;">
                                🍀 Trevos: ${game.trevos.join(' - ')}
                            </div>
                        ` : ''}
                        ${game.mesSorte ? `
                            <div style="font-size: 10px; color: #f97316; margin-top: 5px;">
                                📅 Mês: ${getNomeMes(game.mesSorte)}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            html += `</div>`;
            
            // Rodapé com informações
            html += `
                <div style="margin-top: 15px; padding: 10px; background: #1e293b; border-radius: 8px; text-align: center; font-size: 11px; color: #94a3b8;">
                    💰 Créditos gastos: R$ ${result.creditsSpent || (qtd * 3)} | 
                    Saldo restante: R$ ${result.creditsRemaining || window.creditosUsuario}
                    ${result.isPro ? ' ⭐ PRO' : ''}
                </div>
            `;
            
            resultadosDiv.innerHTML = html;
            
            // Scroll para os resultados
            resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        window.mostrarToast(`✅ ${qtd} jogo(s) gerado(s) com IA ${modo}!`, 'success');
        
    } catch (error) {
        console.error('❌ Erro na API:', error);
        if (resultadosDiv) {
            resultadosDiv.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <h4 style="color: #ef4444; margin: 0 0 10px 0;">Erro ao gerar jogos</h4>
                    <p style="color: #fca5a5; font-size: 13px; margin: 0 0 15px 0;">${error.message || 'Erro desconhecido'}</p>
                    <button onclick="window.gerarJogos()" style="background: #8b5cf6; border: none; padding: 10px 24px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">
                        🔄 Tentar novamente
                    </button>
                </div>
            `;
        }
        window.mostrarToast('❌ Erro ao gerar jogos. Tente novamente.', 'error');
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.gerarJogos = gerarJogos;
window.validarSaldoEAcesso = validarSaldoEAcesso;
window.getNomeMes = getNomeMes;

console.log('✅ JOGOS.js carregado (VERSÃO 2.3 - COMPLETA E CORRIGIDA)');
