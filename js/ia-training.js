// ============================================
// IA-TRAINING.js - Treinamento, Backtest e Relatórios (FASE 10)
// ============================================

// ============================================
// TREINAR IA COM FILTROS ATUAIS
// ============================================
async function treinarIAComFiltrosAtuais() {
    // Verificar login
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return false;
    }
    
    // Obter dados e configurações
    const dadosFiltrados = window.filtrarDados();
    const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
    const config = window.LOTERIAS[loteria];
    
    // Validar dados mínimos
    if (dadosFiltrados.length < 10) {
        window.mostrarToast('Dados insuficientes! Mínimo 10 concursos.', 'error');
        return false;
    }
    
    // Iniciar treinamento
    window.setIsTraining(true);
    
    const pb = document.getElementById('trainingProgressBar');
    const log = document.getElementById('trainingLog');
    const status = document.getElementById('trainingStatus');
    const filtrosTreinamento = window.getFiltrosAtivos();
    
    window.setFiltrosTreinamento(filtrosTreinamento);
    window.atualizarAnimacaoTreinamento('training');
    
    if (status) {
        status.textContent = 'Aprendendo...';
        status.className = 'status-badge status-training';
    }
    
    if (log) {
        log.innerHTML = `🧠 IA iniciando...\n📊 ${dadosFiltrados.length} concursos\n`;
    }
    
    if (pb) pb.style.width = '0%';
    
    // Simular etapas de treinamento
    for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 150));
        if (pb) pb.style.width = `${((i + 1) / 4) * 100}%`;
        if (log) log.innerHTML += `📊 Etapa ${i + 1}... ok\n`;
    }
    
    // Criar e treinar o modelo
    const aiModel = new AdvancedLotteryAI(dadosFiltrados, config.maxNumero, config.nome);
    const sucesso = aiModel.treinar();
    
    // Atualizar estado
    window.setIaTreinada(sucesso);
    window.setAiModel(aiModel);
    
    if (pb) pb.style.width = '100%';
    if (status) status.textContent = sucesso ? '✓ Treinado' : 'Falha';
    if (log) log.innerHTML += `\n✅ Confiança: ${aiModel.confianca}%\n`;
    
    window.atualizarAnimacaoTreinamento(sucesso ? 'trained' : 'none');
    window.setIsTraining(false);
    
    // Atualizar container de filtros
    const filtrosContainer = document.getElementById('filtrosAplicadosContainer');
    if (filtrosContainer && sucesso && filtrosTreinamento) {
        filtrosContainer.innerHTML = `<div class="filtros-aplicados"><h4>📋 Configuração ${window.isUserPro ? '' : '(MASCARADO)'}</h4><div>${filtrosTreinamento.map(f => `<span class="filtro-item">${f.label}: <strong>${window.isUserPro ? f.valor : window.mascararConfiguracoes(f.valor)}</strong></span>`).join('')}</div></div>`;
    }
    
    return sucesso;
}

// ============================================
// EXECUTAR BACKTESTING
// ============================================
async function executarBacktesting() {
    // Verificar login
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return null;
    }
    
    // Obter dados e configurações
    const dados = window.filtrarDados();
    const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
    const config = window.LOTERIAS[loteria];
    const dispersao = window.dispersaoAtual ? window.dispersaoAtual() : 15;
    
    // Validar dados mínimos
    if (dados.length < 20) {
        window.mostrarToast('Mínimo 20 concursos para backtest!', 'warning');
        return null;
    }
    
    const div = document.getElementById('backtestResultados');
    if (div) div.innerHTML = '<p>🔄 Executando backtest...</p>';
    await new Promise(r => setTimeout(r, 100));
    
    // Configurar janela de treinamento (70% dos dados ou max 30 concursos)
    const janela = Math.min(30, Math.floor(dados.length * 0.7));
    let acertosIA = 0;
    let total = 0;
    
    // Backtest da IA
    for (let i = janela; i < dados.length; i++) {
        const hist = dados.slice(i - janela, i);
        const teste = new AdvancedLotteryAI(hist, config.maxNumero, config.nome);
        teste.treinar();
        const pred = teste.predizerIAEspecialista(config.numeros, config.temDispersao, dispersao, i);
        acertosIA += pred.filter(n => dados[i].includes(n)).length;
        total++;
    }
    
    const percIA = total > 0 ? ((acertosIA / (total * config.numeros)) * 100).toFixed(1) : '0.0';
    
    // Backtest do aleatório puro (para comparação)
    let acertosRand = 0;
    for (let i = janela; i < dados.length; i++) {
        const rand = [];
        const maxNum = config.maxNumero + (config.incluirZero ? 1 : 0);
        while (rand.length < config.numeros) {
            rand.push(Math.floor(Math.random() * maxNum));
        }
        rand.sort((a, b) => a - b);
        acertosRand += rand.filter(n => dados[i].includes(n)).length;
    }
    
    const percRand = ((acertosRand / (total * config.numeros)) * 100).toFixed(1);
    const melhoria = (parseFloat(percIA) - parseFloat(percRand)).toFixed(1);
    
    // Renderizar resultados
    if (div) {
        div.innerHTML = `
            <h4>📊 Backtesting</h4>
            <div class="backtest-result">🧠 IA Especialista: ${percIA}%</div>
            <div class="backtest-result">🎲 Aleatório Puro: ${percRand}%</div>
            <div class="backtest-result">📈 Melhoria: +${melhoria}%</div>
        `;
    }
    
    return { percentualIA: percIA, percentualRand: percRand, melhoria: melhoria };
}

// ============================================
// MOSTRAR RELATÓRIO DE PADRÕES
// ============================================
function mostrarRelatorioPadroes() {
    // Verificar login
    if (!window.usuarioAtual) {
        window.mostrarModalLogin();
        return;
    }
    
    // Verificar IA treinada
    const iaTreinada = window.iaTreinada ? window.iaTreinada() : false;
    const aiModel = window.aiModel ? window.aiModel() : null;
    
    if (!aiModel || !iaTreinada) {
        window.mostrarToast('Treine a IA primeiro!', 'warning');
        return;
    }
    
    // Gerar relatório
    const r = aiModel.gerarRelatorio();
    
    const html = `
        <div class="modal-overlay" id="modalRelatorio">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>📊 Relatório de Padrões - ${r.loteria}</h3>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">🎯 Confiança: ${r.confiancaGeral}%</div>
                        <div class="stat-card">📊 Concursos: ${r.totalDados}</div>
                    </div>
                    <h4>🏆 Top 10 Números (Maior Pontuação)</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${r.melhoresNumerosAtuais.map(n => `
                            <span class="filtro-item" style="background: #f59e0b20; color: #f59e0b;">
                                ${String(n.numero).padStart(2, '0')} (${n.pontuacao} pts)
                            </span>
                        `).join('')}
                    </div>
                    <p style="margin-top: 15px; font-size: 11px; color: var(--text-secondary);">
                        💡 Números com maior pontuação são os mais atrasados ou com menor frequência recente.
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn-voltar" onclick="window.fecharModalRelatorio()">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================
// FECHAR MODAL DE RELATÓRIO
// ============================================
function fecharModalRelatorio() {
    document.getElementById('modalRelatorio')?.remove();
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.treinarIAComFiltrosAtuais = treinarIAComFiltrosAtuais;
window.executarBacktesting = executarBacktesting;
window.mostrarRelatorioPadroes = mostrarRelatorioPadroes;
window.fecharModalRelatorio = fecharModalRelatorio;
