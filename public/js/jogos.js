// js/jogos.js - VERSÃO 2.1 (COM IA SELECIONADA) 03/07/2026
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
            mode: modo,  // 🔥 IA SELECIONADA
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
        
        // Renderizar resultados...
        // ... resto do código existente ...
        
        window.mostrarToast(`${qtd} jogo(s) gerado(s) com IA ${modo}!`, 'success');
        
    } catch (error) {
        console.error('Erro na API:', error);
        // ... tratamento de erro existente ...
    }
}

// EXPORTAÇÃO
window.gerarJogos = gerarJogos;
window.validarSaldoEAcesso = validarSaldoEAcesso;
window.getNomeMes = getNomeMes;

console.log('✅ JOGOS.js carregado (VERSÃO 2.1 - COM IA SELECIONADA)');
