// ============================================
// CAMINHO: public/js/loterias.js
// ============================================
// VERSÃO 2.2 - COMPLETA E CORRIGIDA
// ============================================

// ============================================
// RENDERIZAR CONTEÚDO DA LOTERIA
// ============================================
function renderizarConteudoLoteria(loteriaId) {
    const container = document.getElementById('conteudoLoteria');
    const config = window.LOTERIAS[loteriaId];
    
    if (!config) {
        container.innerHTML = `<div class="mensagem-erro">⚠️ Loteria não encontrada</div>`;
        return;
    }
    
    // Verificar se é PRO
    const isPro = window.isUserPro || false;
    
    const html = `
        <!-- Card: Configurar e Gerar Jogos -->
        <div class="card">
            <h3 style="color: #f59e0b; margin-bottom: 15px;">⚙️ Configurar e Gerar Jogos</h3>
            
            <!-- Botões de IA (dentro do card) -->
            <label class="config-label-ia">🤖 Selecione o Motor de IA</label>
            <div class="ia-selector-container" id="iaSelectorCard">
                <button class="ia-btn" data-ia="statistical" title="Análise de frequência, atraso e dispersão">
                    📊 Estatística
                </button>
                <button class="ia-btn active" data-ia="hybrid" title="Combina estatística, probabilidade e tendência">
                    🧠 Híbrida
                    <span class="badge-free">REC</span>
                </button>
                <button class="ia-btn" data-ia="specialist" title="Avalia e seleciona os melhores jogos">
                    🎯 Especialista
                </button>
                <button class="ia-btn" data-ia="smartrandom" title="Aleatório com ponderação estatística">
                    🎲 Aleatório
                </button>
                <button class="ia-btn pro-only" data-ia="probability" title="${isPro ? 'Distribuição binomial, entropia e variância' : '🔒 Exclusivo PRO'}">
                    📈 Probabilística
                    <span class="badge-pro">⭐PRO</span>
                </button>
                <button class="ia-btn pro-only" data-ia="predictive" title="${isPro ? 'Detecta padrões e tenta prever os próximos números' : '🔒 Exclusivo PRO'}">
                    🔮 Preditiva
                    <span class="badge-pro">⭐PRO</span>
                </button>
            </div>
            
            <hr style="border-color: var(--border); margin: 15px 0;">
            
            <!-- Configurações -->
            <div class="config-grid">
                <!-- Quantidade de jogos -->
                <div class="quantidade-container">
                    <label class="config-label">📊 Quantidade de Jogos</label>
                    <input type="number" id="qtdJogos" class="quantidade-input" value="1" min="1" max="50">
                    <input type="range" id="qtdRange" class="quantidade-range" min="1" max="50" value="1" step="1">
                </div>
                
                <!-- Dispersão -->
                <div class="dispersao-slider">
                    <label class="config-label">🎯 Dispersão</label>
                    <input type="range" id="dispersaoRange" min="5" max="30" value="15" step="1">
                    <div class="dispersao-valor">
                        <span>Janela: <strong id="dispersaoValor">15</strong> concursos</span>
                        <span style="margin-left: 15px; font-size: 11px; color: var(--text-secondary);">
                            (mais = mais dispersão)
                        </span>
                    </div>
                </div>
                
                <!-- Modo Bolão -->
                <div>
                    <label class="config-label" style="display: flex; align-items: center; gap: 10px;">
                        📊 Modo Bolão
                        <span id="bolaoBadge" class="${isPro ? 'badge-pro' : 'badge-free'}" style="font-size: 10px;">
                            ${isPro ? '⭐ PRO ATIVO' : '⭐ PRO'}
                        </span>
                    </label>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                            <input type="checkbox" id="modoBolaoCheckbox" 
                                   onchange="window.toggleModoBolao()"
                                   ${isPro ? '' : 'disabled'}
                                   style="width: 18px; height: 18px; cursor: pointer;">
                            <span style="font-size: 13px; color: var(--text-secondary);">Ativar Bolão</span>
                        </label>
                        <div id="bolaoConfig" style="display: none; align-items: center; gap: 8px;">
                            <span style="font-size: 12px; color: #94a3b8;">Números:</span>
                            <input type="number" id="qtdNumerosBolao" 
                                   value="${config.jogoSimples + 1}" 
                                   min="${config.jogoSimples}" 
                                   max="${config.maxNumeros || config.jogoSimples * 2}"
                                   style="width: 60px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary); font-size: 13px;">
                            <span style="font-size: 10px; color: #94a3b8;">
                                (min ${config.jogoSimples} | max ${config.maxNumeros || config.jogoSimples * 2})
                            </span>
                        </div>
                    </div>
                    ${!isPro ? `<div style="font-size: 10px; color: #f59e0b; margin-top: 4px;">⭐ Faça upgrade para PRO para usar o Modo Bolão</div>` : ''}
                </div>
            </div>
            
            <!-- Botão Gerar -->
            <div style="margin-top: 15px; text-align: center;">
                <button onclick="window.gerarJogos()" class="btn btn-primary" style="padding: 12px 40px; font-size: 16px; min-width: 200px;">
                    🎲 Gerar Jogos com IA
                </button>
            </div>
        </div>
        
        <!-- Resultados -->
        <div id="resultados"></div>
    `;
    
    container.innerHTML = html;
    
    // Reativar eventos dos botões de IA
    document.querySelectorAll('#iaSelectorCard .ia-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const ia = this.dataset.ia;
            
            // Verificar se é PRO
            if (this.classList.contains('pro-only')) {
                const isProUser = window.isUserPro || false;
                if (!isProUser) {
                    window.mostrarToast('⭐ Essa IA é exclusiva para assinantes PRO!', 'warning');
                    return;
                }
            }
            
            document.querySelectorAll('#iaSelectorCard .ia-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            window.iaSelecionada = ia;
            console.log('🤖 IA selecionada:', ia);
        });
    });
    
    // Reativar eventos dos sliders
    const qtdRange = document.getElementById('qtdRange');
    const qtdJogos = document.getElementById('qtdJogos');
    const dispersaoRange = document.getElementById('dispersaoRange');
    const dispersaoValor = document.getElementById('dispersaoValor');
    
    if (qtdRange && qtdJogos) {
        qtdRange.addEventListener('input', function() {
            qtdJogos.value = this.value;
        });
        qtdJogos.addEventListener('input', function() {
            let val = parseInt(this.value) || 1;
            if (val < 1) val = 1;
            if (val > 50) val = 50;
            this.value = val;
            qtdRange.value = val;
        });
    }
    
    if (dispersaoRange && dispersaoValor) {
        dispersaoRange.addEventListener('input', function() {
            dispersaoValor.textContent = this.value;
        });
    }
}

// ============================================
// TOGGLE MODO BOLÃO (GLOBAL)
// ============================================
window.toggleModoBolao = function() {
    const checkbox = document.getElementById('modoBolaoCheckbox');
    const config = document.getElementById('bolaoConfig');
    const badge = document.getElementById('bolaoBadge');
    const isProUser = window.isUserPro || false;
    
    if (!checkbox) return;
    
    if (checkbox.checked) {
        if (!isProUser) {
            window.mostrarToast('⭐ Modo Bolão é exclusivo para assinantes PRO!', 'warning');
            checkbox.checked = false;
            if (config) config.style.display = 'none';
            return;
        }
        
        if (config) config.style.display = 'flex';
        if (badge) {
            badge.textContent = '⭐ PRO ATIVO';
            badge.className = 'badge-pro';
        }
        
        const loteria = window.loteriaAtual ? window.loteriaAtual() : 'megasena';
        const loteriaConfig = window.LOTERIAS?.[loteria];
        const qtdNumerosBolao = document.getElementById('qtdNumerosBolao');
        if (loteriaConfig && qtdNumerosBolao) {
            qtdNumerosBolao.min = loteriaConfig.jogoSimples || 6;
            qtdNumerosBolao.max = loteriaConfig.maxNumeros || 20;
            qtdNumerosBolao.value = Math.min(
                parseInt(qtdNumerosBolao.value) || loteriaConfig.jogoSimples + 1,
                loteriaConfig.maxNumeros || 20
            );
        }
        
        window.mostrarToast('📊 Modo Bolão ativado!', 'success');
        
    } else {
        if (config) config.style.display = 'none';
        if (badge) {
            badge.textContent = '⭐ PRO';
            badge.className = 'badge-free';
        }
    }
};

window.verificarStatusBolao = function() {
    const checkbox = document.getElementById('modoBolaoCheckbox');
    const badge = document.getElementById('bolaoBadge');
    const isProUser = window.isUserPro || false;
    
    if (!checkbox) return;
    
    if (checkbox.checked) {
        if (!isProUser) {
            checkbox.checked = false;
            const config = document.getElementById('bolaoConfig');
            if (config) config.style.display = 'none';
            if (badge) {
                badge.textContent = '⭐ PRO';
                badge.className = 'badge-free';
            }
        } else {
            if (badge) {
                badge.textContent = '⭐ PRO ATIVO';
                badge.className = 'badge-pro';
            }
        }
    }
};

// ============================================
// CARREGAR GRID DE LOTERIAS
// ============================================
function carregarGridLoterias() {
    console.log('🔄 Carregando grid de loterias...');
    const grid = document.getElementById('lotteryGrid');
    if (!grid) {
        console.error('❌ Elemento lotteryGrid não encontrado');
        return;
    }
    
    const loterias = window.LOTERIAS || {};
    const ids = Object.keys(loterias);
    
    if (ids.length === 0) {
        console.warn('⚠️ Nenhuma loteria encontrada');
        grid.innerHTML = '<p style="color: var(--text-secondary);">Nenhuma loteria disponível</p>';
        return;
    }
    
    // Pegar a loteria atualmente selecionada
    const loteriaAtual = window.loteriaAtual || 'megasena';
    
    grid.innerHTML = ids.map(id => {
        const config = loterias[id];
        const isActive = id === loteriaAtual ? 'active' : '';
        return `
            <div class="lottery-card ${isActive}" 
                 onclick="window.selecionarLoteria('${id}')" 
                 id="card-${id}"
                 data-loteria="${id}">
                <h3>${config.icone || '🎰'} ${config.nome || id}</h3>
                <p class="rules">${config.numerosCSV || '?'} números • 1 a ${config.maxNumero || '?'}</p>
                ${config.temElementoExtra ? `<p class="rules">+ ${config.nomeElemento || 'Extra'}</p>` : ''}
            </div>
        `;
    }).join('');
    
    console.log(`✅ Grid carregado com ${ids.length} loterias`);
}

// ============================================
// SELECIONAR LOTERIA
// ============================================
function selecionarLoteria(id) {
    console.log(`🎯 Selecionando loteria: ${id}`);
    window.loteriaAtual = id;
    
    // Atualizar grid
    document.querySelectorAll('.lottery-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.loteria === id) {
            card.classList.add('active');
        }
    });
    
    // Carregar conteúdo da loteria
    if (typeof window.renderizarConteudoLoteria === 'function') {
        window.renderizarConteudoLoteria(id);
    } else {
        console.warn('⚠️ renderizarConteudoLoteria não disponível');
        // Fallback: carregar conteúdo básico
        const container = document.getElementById('conteudoLoteria');
        if (container) {
            const config = window.LOTERIAS?.[id];
            container.innerHTML = `
                <div class="card">
                    <h3>${config?.icone || '🎰'} ${config?.nome || id}</h3>
                    <p style="color: var(--text-secondary);">Selecione as opções e clique em "Gerar Jogos"</p>
                    <button onclick="window.gerarJogos()" class="btn btn-primary">
                        🎲 Gerar Jogos
                    </button>
                </div>
            `;
        }
    }
}

// ============================================
// EXPORTAÇÕES PARA O WINDOW
// ============================================
window.carregarGridLoterias = carregarGridLoterias;
window.selecionarLoteria = selecionarLoteria;
window.renderizarConteudoLoteria = renderizarConteudoLoteria;

console.log('✅ LOTERIAS.js carregado (VERSÃO 2.2 - COMPLETA E CORRIGIDA)');
