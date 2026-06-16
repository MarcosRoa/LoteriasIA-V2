// ============================================
// LOTERIAS.js - Gerenciamento de loterias (FASE 18 - CACHE OTIMIZADO + LOTECA)
// ============================================
// LOTERIAS.js - Gerenciamento de loterias (FASE 18 - CACHE OTIMIZADO)
// ============================================

// ============================================
// VARIÁVEIS LOCAIS
// ============================================
let loteriaAtual = 'megasena';
let dadosAtuais = [];
let dadosExtrasAtuais = [];
let periodoSelecionado = 'all';
let dispersaoAtual = 15;
let isTraining = false;
let iaTreinada = false;
let aiModel = null;
let filtrosTreinamento = null;

// Cache persistente em memória
const cacheCSV = {};
const cacheProcessamento = {};

// Debounce para evitar cálculos excessivos
let debounceTimeout = null;

// ============================================
// FUNÇÃO DE DEBOUNCE
// ============================================
function debounce(func, wait) {
    return function executedFunction(...args) {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            func(...args);
            debounceTimeout = null;
        }, wait);
    };
}

// ============================================
// FUNÇÕES DE DATA E FILTRO (COM CACHE)
// ============================================
function getDataCortePorAnos(anos) {
    const datas = window.cacheDatas[loteriaAtual]?.datas || [];
    let ultimaData = null;
    
    if (datas.length > 0) {
        for (let i = datas.length - 1; i >= 0; i--) {
            const dataStr = datas[i];
            if (dataStr) {
                const partes = dataStr.split('/');
                if (partes.length === 3) {
                    const dataConcurso = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                    if (!isNaN(dataConcurso.getTime())) {
                        ultimaData = dataConcurso;
                        break;
                    }
                }
            }
        }
    }
    
    const dataReferencia = ultimaData || new Date();
    return new Date(dataReferencia.getFullYear() - anos, dataReferencia.getMonth(), dataReferencia.getDate());
}

function filtrarDadosPorData(anos) {
    const cacheKey = `${loteriaAtual}_${anos}`;
    if (cacheProcessamento[cacheKey]) return [...cacheProcessamento[cacheKey]];
    
    if (!window.cacheDatas[loteriaAtual]?.datas?.length) return dadosAtuais;
    const dataCorte = getDataCortePorAnos(anos);
    const dadosFiltrados = [];
    for (let i = 0; i < dadosAtuais.length; i++) {
        const dataConcursoStr = window.cacheDatas[loteriaAtual].datas[i];
        if (dataConcursoStr) {
            const partes = dataConcursoStr.split('/');
            if (partes.length === 3) {
                const dataConcurso = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (dataConcurso >= dataCorte) dadosFiltrados.push(dadosAtuais[i]);
            } else { dadosFiltrados.push(dadosAtuais[i]); }
        } else { dadosFiltrados.push(dadosAtuais[i]); }
    }
    
    cacheProcessamento[cacheKey] = dadosFiltrados;
    return dadosFiltrados;
}

function filtrarDados() {
    if (periodoSelecionado === 'all') return [...dadosAtuais];
    if (periodoSelecionado === 1) return filtrarDadosPorData(1);
    if (periodoSelecionado === 3) return filtrarDadosPorData(3);
    if (periodoSelecionado === 5) return filtrarDadosPorData(5);
    if (periodoSelecionado === 7) return filtrarDadosPorData(7);
    if (periodoSelecionado === 9) return filtrarDadosPorData(9);
    return [...dadosAtuais];
}

function getPeriodoTexto() {
    if (periodoSelecionado === 'all') {
        return `Todos os concursos (${dadosAtuais.length} concursos)`;
    }
    const dadosFiltrados = filtrarDados();
    return `${periodoSelecionado} ano(s) (${dadosFiltrados.length} concursos)`;
}

function getDatasPeriodo() {
    const dadosFiltrados = filtrarDados();
    const datasFiltradas = window.cacheDatas[loteriaAtual]?.datas || [];
    if (datasFiltradas.length === 0 || dadosFiltrados.length === 0) return { inicio: 'N/A', fim: 'N/A' };
    
    let primeiraData = null;
    let ultimaData = null;
    
    for (let i = 0; i < dadosAtuais.length; i++) {
        const dataStr = window.cacheDatas[loteriaAtual]?.datas[i];
        if (dataStr && dadosFiltrados.includes(dadosAtuais[i])) {
            const partes = dataStr.split('/');
            if (partes.length === 3) {
                if (!primeiraData) primeiraData = dataStr;
                ultimaData = dataStr;
            }
        }
    }
    
    return { inicio: primeiraData || 'N/A', fim: ultimaData || 'N/A' };
}

function getFiltrosAtivos() {
    const config = window.LOTERIAS[loteriaAtual];
    const modo = document.getElementById('modoGeracao')?.value || 'ia_especialista';
    const periodoTexto = getPeriodoTexto();
    const qtdJogos = document.getElementById('qtdJogos')?.value || 1;
    const dadosFiltrados = filtrarDados();
    const modoBolaoAtivo = document.getElementById('modoBolaoCheckbox')?.checked || false;
    const qtdNumerosBolao = document.getElementById('qtdNumerosBolao')?.value || config.jogoSimples;
    
    let filtros = [
        { label: 'Loteria', valor: `${config.icone} ${config.nome}` },
        { label: 'Período', valor: periodoTexto },
        { label: 'Modo IA', valor: window.getModoTexto(modo) },
        { label: 'Quantidade', valor: `${qtdJogos} jogos` },
        { label: 'Base dados', valor: `${dadosFiltrados.length} concursos` }
    ];
    if (modoBolaoAtivo && config.permiteBolao && window.isUserPro) {
        filtros.push({ label: 'Modo Bolão', valor: `${qtdNumerosBolao} números por jogo` });
    }
    if (config.temDispersao) filtros.push({ label: 'Dispersão', valor: `${dispersaoAtual} concursos` });
    return filtros;
}

// Versão com debounce para setPeriodo
const setPeriodoDebounced = debounce((p) => {
    periodoSelecionado = p;
    iaTreinada = false;
    aiModel = null;
    renderizarConteudo(loteriaAtual);
    if (dadosAtuais.length >= 10) setTimeout(() => window.treinarIAComFiltrosAtuais(), 500);
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
}, 100);

function setPeriodo(p) {
    setPeriodoDebounced(p);
}

// Versão com debounce para atualizarDispersao
const atualizarDispersaoDebounced = debounce((v) => {
    dispersaoAtual = parseInt(v);
    document.getElementById('dispersaoValor') && (document.getElementById('dispersaoValor').textContent = `${v} concursos`);
    iaTreinada = false;
    aiModel = null;
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
}, 100);

function atualizarDispersao(v) {
    atualizarDispersaoDebounced(v);
}

// ============================================
// FUNÇÕES DO MODO BOLÃO
// ============================================
function toggleModoBolao() {
    const checkbox = document.getElementById('modoBolaoCheckbox');
    const bolaoContainer = document.getElementById('bolaoContainer');
    const config = window.LOTERIAS[loteriaAtual];
    
    if (checkbox && checkbox.checked && window.isUserPro && config.permiteBolao) {
        if (bolaoContainer) bolaoContainer.style.display = 'block';
        const qtdInput = document.getElementById('qtdNumerosBolao');
        if (qtdInput) {
            qtdInput.min = config.minNumeros;
            qtdInput.max = config.maxNumeros;
            qtdInput.value = config.jogoSimples;
        }
        document.getElementById('qtdNumerosValue') && (document.getElementById('qtdNumerosValue').innerText = config.jogoSimples);
    } else {
        if (bolaoContainer) bolaoContainer.style.display = 'none';
    }
    
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
}

function atualizarQuantidadeNumerosBolao(valor) {
    document.getElementById('qtdNumerosValue') && (document.getElementById('qtdNumerosValue').innerText = valor);
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
}

// ============================================
// ANIMAÇÃO DE TREINAMENTO
// ============================================
function atualizarAnimacaoTreinamento(status) {
    const container = document.getElementById('iaTrainingAnimation');
    if (!container) return;
    if (status === 'training') {
        container.className = 'ia-training-animation';
        container.innerHTML = `<div class="ia-training-text">🧠 INTELIGÊNCIA ARTIFICIAL EM TREINAMENTO...</div><div class="ia-training-subtext">Analisando padrões e processando dados históricos</div>`;
        container.style.display = 'block';
    } else if (status === 'trained') {
        container.className = 'ia-training-animation treinado';
        container.innerHTML = `<div class="ia-training-text treinado">✅ INTELIGÊNCIA ARTIFICIAL TREINADA!</div><div class="ia-training-subtext">Pronto para gerar palpites com alta precisão</div>`;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// ============================================
// PROCESSAR CSV (COM CACHE) - CORRIGIDO PARA LOTECA
// ============================================
function processarCSV(loteria, texto, nome) {
    const config = window.LOTERIAS[loteria];
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    
    if (linhas.length < 2) return;
    
    // CORREÇÃO: Força separador ';' para Loteca
    let sep = (loteria === 'loteca') ? ';' : (linhas[0].includes(';') ? ';' : ',');
    
    const dados = [];
    const dadosExtras = [];
    const datas = [];
    
    function isDataValida(str) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(str) || /^\d{4}-\d{2}-\d{2}$/.test(str);
    }
    
    function parseData(str) {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const [a, m, d] = str.split('-');
            return `${d}/${m}/${a}`;
        }
        return null;
    }
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;
        
        let colunas = linha.split(sep);
        
        while (colunas.length > 0 && (colunas[colunas.length - 1].trim() === '' || colunas[colunas.length - 1].trim().includes(';'))) {
            colunas.pop();
        }
        
        if (colunas.length < 2) continue;
        
        let data = null;
        let dataIndex = -1;
        for (let j = 0; j < colunas.length; j++) {
            const valor = colunas[j].trim();
            if (isDataValida(valor)) {
                data = parseData(valor);
                dataIndex = j;
                break;
            }
        }
        
        if (!data) continue;
        
        datas.push(data);
        
        const numeros = [];
        let timeCoracao = null;
        
        for (let j = dataIndex + 1; j < colunas.length; j++) {
            let valor = colunas[j]?.trim();
            if (valor === '' || valor === undefined) continue;
            
            // CORREÇÃO: Tratamento especial para Loteca
            if (loteria === 'loteca') {
                if (valor === 'Coluna 1') {
                    numeros.push(1);
                } else if (valor === 'Coluna do meio') {
                    numeros.push(0);
                } else if (valor === 'Coluna 2') {
                    numeros.push(2);
                }
                continue;
            }
            
            if (loteria === 'timemania') {
                const numTeste = parseInt(valor);
                if (isNaN(numTeste) || valor.includes('/') || /[A-Za-zÀ-ú]/.test(valor)) {
                    timeCoracao = valor;
                    continue;
                }
            }
            
            let num = parseInt(valor);
            if (isNaN(num)) {
                const numStr = valor.toString().trim();
                if (/^\d+$/.test(numStr)) {
                    num = parseInt(numStr);
                } else {
                    continue;
                }
            }
            
            if (num >= 0 && num <= config.maxNumero) {
                numeros.push(num);
            }
        }
        
        // CORREÇÃO: Para Loteca, NÃO ordenar os números (a ordem dos jogos importa!)
        if (loteria === 'loteca') {
            if (numeros.length === config.numeros) {
                dados.push([...numeros]);
                dadosExtras.push(null);
            }
        } else {
            // Para outras loterias, mantém a ordenação original
            if (numeros.length >= config.numeros) {
                const numerosOrdenados = numeros.slice(0, config.numeros).sort((a, b) => a - b);
                dados.push(numerosOrdenados);
                
                if (loteria === 'timemania' && timeCoracao) {
                    dadosExtras.push(timeCoracao);
                } else {
                    dadosExtras.push(null);
                }
            }
        }
    }
    
    if (dados.length > 0) {
        window.cacheDados[loteria] = { dados, carregado: true, nomeArquivo: nome };
        window.cacheDatas[loteria] = { datas };
        window.cacheDadosExtras = window.cacheDadosExtras || {};
        window.cacheDadosExtras[loteria] = dadosExtras;
        
        // Limpar cache de processamento para esta loteria
        Object.keys(cacheProcessamento).forEach(key => {
            if (key.startsWith(loteria)) delete cacheProcessamento[key];
        });
        
        if (loteriaAtual === loteria) { 
            dadosAtuais = [...dados]; 
            if (loteria === 'timemania') {
                dadosExtrasAtuais = [...dadosExtras];
            }
            renderizarConteudo(loteria); 
            if (dados.length >= 10) setTimeout(() => window.treinarIAComFiltrosAtuais(), 500); 
        }
        window.mostrarToast(`${config.nome}: ${dados.length} concursos carregados!`, 'success');
    } else {
        console.warn(`Nenhum dado válido encontrado para ${loteria}`);
        window.mostrarToast(`Erro ao carregar ${config.nome}: formato inválido`, 'error');
    }
}

function importarArquivo(input, loteria) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => processarCSV(loteria, e.target.result, file.name);
    reader.readAsText(file);
    input.value = '';
}

// ============================================
// CARREGAR GRID DE LOTERIAS
// ============================================
function carregarGridLoterias() {
    const grid = document.getElementById('lotteryGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(window.LOTERIAS).map(([id, c]) => `<div class="lottery-card ${id==='megasena'?'active':''}" onclick="window.selecionarLoteria('${id}')" id="card-${id}"><div class="ia-status nao-treinado" id="status-${id}"></div><h3>${c.icone} ${c.nome}</h3><p class="rules">${c.numeros} números • 1 a ${c.maxNumero}${c.temMes ? ' + Mês' : ''}${c.temTime ? ' + Time' : ''}${c.temTrevos ? ' + Trevos' : ''}</p></div>`).join('');
}

// ============================================
// LIMPAR RESULTADOS AO TROCAR DE LOTERIA
// ============================================
function limparResultados() {
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) resultadosDiv.innerHTML = '';
    const backtestDiv = document.getElementById('backtestResultados');
    if (backtestDiv) backtestDiv.innerHTML = '';
}

// ============================================
// SELECIONAR LOTERIA (COM CARREGAMENTO SOB DEMANDA)
// ============================================
async function selecionarLoteria(loteria) {
    limparResultados();
    
    loteriaAtual = loteria;
    iaTreinada = false; 
    aiModel = null;
    const config = window.LOTERIAS[loteria];
    if (config.temDispersao) dispersaoAtual = config.dispersaoPadrao;
    document.querySelectorAll('.lottery-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`card-${loteria}`)?.classList.add('active');
    
    // Verificar cache primeiro
    if (window.cacheDados[loteria].carregado) {
        dadosAtuais = [...window.cacheDados[loteria].dados];
        if (window.cacheDadosExtras && window.cacheDadosExtras[loteria]) {
            dadosExtrasAtuais = [...window.cacheDadosExtras[loteria]];
        }
        renderizarConteudo(loteria);
        if (dadosAtuais.length >= 10 && !iaTreinada && !isTraining) {
            setTimeout(() => window.treinarIAComFiltrosAtuais(), 500);
        }
        return;
    }
    
    // Carregar sob demanda
    dadosAtuais = [];
    try { 
        const r = await fetch(`/csv/${loteria}.csv`);
        if (r.ok) processarCSV(loteria, await r.text(), `csv/${loteria}.csv`); 
        else console.log(`Arquivo csv/${loteria}.csv não encontrado`);
    } catch(e) { console.log(`Erro ao carregar csv/${loteria}.csv:`, e); }
}

// ============================================
// RENDERIZAR CONTEÚDO DA LOTERIA
// ============================================
function renderizarConteudo(loteria) {
    const config = window.LOTERIAS[loteria];
    const div = document.getElementById('conteudoLoteria');
    if (!div) return;
    const cache = window.cacheDados[loteria];
    const dadosCount = dadosAtuais.length;
    const dadosFiltradosCount = filtrarDados().length;
    const datasPeriodo = getDatasPeriodo();
    
    let controlesExtras = '';
    if (config.temDispersao) controlesExtras += `<div class="dispersao-slider">
        <label class="config-label">🎯 Dispersão</label>
        <input type="range" id="dispersaoSlider" min="${config.dispersaoMin}" max="${config.dispersaoMax}" value="${dispersaoAtual}" oninput="window.atualizarDispersao(this.value)">
        <div class="dispersao-valor">Bloquear números recentes: <strong id="dispersaoValor">${dispersaoAtual} concursos</strong></div>
    </div>`;
    
    let html = `<div class="card"><h3 style="color:${config.cor};">${config.icone} ${config.nome} - IA V.6.1 PRO</h3>`;
    if (!cache.carregado) html += `<div class="mensagem-erro"><strong>⚠️ Nenhum dado!</strong><br>📁 Upload do CSV (pasta /csv/)</div>`;
    html += `<div style="display:flex;gap:15px;flex-wrap:wrap;margin:15px 0;"><h4>📁 ${dadosCount} concursos</h4><span id="trainingStatus" class="status-badge ${iaTreinada?'status-ready':'status-error'}">${iaTreinada?'✓ Treinada':'Pendente'}</span><button class="btn btn-upload" onclick="document.getElementById('uploadManual').click()">📁 Upload CSV</button><input type="file" id="uploadManual" accept=".csv" onchange="importarArquivo(this,'${loteria}')" style="display:none;"></div>`;
    html += `<div class="stats-grid"><div class="stat-card">Concursos: ${dadosCount}</div><div class="stat-card">Período: ${dadosFiltradosCount}</div><div class="stat-card">Engine: 🧠 V.6.1 PRO</div></div></div>`;
    
    html += `<div class="card"><h4>📅 Período (Baseado em data real)</h4><div class="filtros">
        <button class="filtro-btn ${periodoSelecionado === 'all' ? 'ativo' : ''}" onclick="window.setPeriodo('all')">Todos</button>
        <button class="filtro-btn ${periodoSelecionado === 1 ? 'ativo' : ''}" onclick="window.setPeriodo(1)">1 Ano</button>
        <button class="filtro-btn ${periodoSelecionado === 3 ? 'ativo' : ''}" onclick="window.setPeriodo(3)">3 Anos</button>
        <button class="filtro-btn ${periodoSelecionado === 5 ? 'ativo' : ''}" onclick="window.setPeriodo(5)">5 Anos</button>
        <button class="filtro-btn ${periodoSelecionado === 7 ? 'ativo' : ''}" onclick="window.setPeriodo(7)">7 Anos</button>
        <button class="filtro-btn ${periodoSelecionado === 9 ? 'ativo' : ''}" onclick="window.setPeriodo(9)">9 Anos</button>
    </div>
    <p>📊 ${getPeriodoTexto()}</p>
    <div class="info-periodo">
        <div class="info-periodo-item"><div class="info-periodo-label">📅 DATA INÍCIO</div><div class="info-periodo-valor">${datasPeriodo.inicio}</div></div>
        <div class="info-periodo-item"><div class="info-periodo-label">📅 DATA FIM</div><div class="info-periodo-valor">${datasPeriodo.fim}</div></div>
    </div>
    </div>`;
    
    const animacaoStatus = iaTreinada ? 'trained' : (isTraining ? 'training' : 'none');
    let animacaoHtml = '';
    if (animacaoStatus === 'training') {
        animacaoHtml = `<div id="iaTrainingAnimation" class="ia-training-animation">
            <div class="ia-training-text">🧠 INTELIGÊNCIA ARTIFICIAL EM TREINAMENTO...</div>
            <div class="ia-training-subtext">Analisando padrões e processando dados históricos</div>
        </div>`;
    } else if (animacaoStatus === 'trained') {
        animacaoHtml = `<div id="iaTrainingAnimation" class="ia-training-animation treinado">
            <div class="ia-training-text treinado">✅ INTELIGÊNCIA ARTIFICIAL TREINADA!</div>
            <div class="ia-training-subtext">Pronto para gerar palpites com alta precisão</div>
        </div>`;
    } else {
        animacaoHtml = `<div id="iaTrainingAnimation" style="display: none;"></div>`;
    }
    
    html += `<div class="training-section"><h4>🧠 Treinamento da IA</h4><div style="display:flex;gap:15px;flex-wrap:wrap;"><span id="trainingStatus2" class="status-badge ${iaTreinada?'status-ready':'status-error'}">${iaTreinada?'Treinado ✓':'Não Treinado'}</span><button class="btn btn-treinar" onclick="window.treinarIAComFiltrosAtuais()">🚀 Treinar IA</button><button class="btn btn-backtest" onclick="window.executarBacktesting()">🔬 Backtest</button><button class="btn btn-relatorio" onclick="window.mostrarRelatorioPadroes()">📋 Relatório</button></div><div class="training-progress"><div class="training-progress-bar" id="trainingProgressBar" style="width:${iaTreinada?'100%':'0%'};"></div></div><div class="training-log" id="trainingLog">${iaTreinada?'✅ IA pronta!':'⏳ Clique em Treinar'}</div>${animacaoHtml}</div>`;
    
    // Área de visualização das configurações em tempo real
    html += `<div id="configVisualizacao" style="background: rgba(56, 189, 248, 0.1); border-radius: 12px; padding: 12px; margin: 15px 0; border-left: 4px solid #38bdf8;">
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">📋 CONFIGURAÇÕES ATUAIS:</div>
        <div id="configTags" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span class="filtro-item">⚙️ Aguardando configurações...</span>
        </div>
    </div>`;
    
    // Card de Configurar e Gerar Jogos
    html += `<div class="card"><h4>🎲 Configurar e Gerar Jogos</h4>
    <div class="config-card-grid">
        <div>
            <label class="config-label">📊 Quantidade de Jogos</label>
            <input type="range" id="qtdRange" class="quantidade-range" min="1" max="20" value="1" oninput="window.atualizarQuantidadePorRange(this.value); window.atualizarVisualizacaoConfiguracoes?.()">
            <input type="number" id="qtdJogos" class="quantidade-input" value="1" min="1" max="20" oninput="window.atualizarQuantidadePorInput(this.value); window.atualizarVisualizacaoConfiguracoes?.()">
        </div>
        <div>
            <label class="config-label">🎓 Modo de IA</label>
            <select id="modoGeracao" class="modo-select" onchange="window.atualizarVisualizacaoConfiguracoes?.()">
                <option value="ia_especialista">🎓 IA Especialista</option>
                <option value="aleatorio_inteligente">🎲 Aleatório Inteligente</option>
                <option value="probabilistico">📊 Probabilístico</option>
                <option value="aleatorio_puro">🎯 Aleatório Puro (RNG)</option>
            </select>
        </div>`;
    
    if (config.temDispersao) {
        html += `<div>
            <label class="config-label">🎯 Dispersão</label>
            <input type="range" id="dispersaoSlider" min="${config.dispersaoMin}" max="${config.dispersaoMax}" value="${dispersaoAtual}" oninput="window.atualizarDispersao(this.value); window.atualizarVisualizacaoConfiguracoes?.()">
            <div class="dispersao-valor">Bloquear números recentes: <strong id="dispersaoValor">${dispersaoAtual} concursos</strong></div>
        </div>`;
    }
    
    if (config.permiteBolao) {
        html += `<div>
            <label class="config-label">⭐ MODO BOLÃO (PRO)</label>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <input type="checkbox" id="modoBolaoCheckbox" onchange="window.toggleModoBolao()" ${!window.isUserPro ? 'disabled' : ''}>
                <span style="font-size: 12px; color: var(--text-secondary);">Ativar Bolão</span>
                ${!window.isUserPro ? '<span style="font-size: 10px; color: #f59e0b;">⭐ Exclusivo para PRO</span>' : ''}
            </div>
        </div>`;
    }
    
    html += `</div>`;
    
    if (config.permiteBolao) {
        html += `<div id="bolaoContainer" style="display: none; margin-top: 15px; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; border-left: 4px solid #8b5cf6;">
            <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
                <div style="flex: 2; min-width: 200px;">
                    <label class="config-label">🔢 Quantidade de Números por Jogo</label>
                    <input type="range" id="qtdNumerosBolao" class="quantidade-range" min="${config.minNumeros}" max="${config.maxNumeros}" value="${config.jogoSimples}" oninput="window.atualizarQuantidadeNumerosBolao(this.value); window.atualizarVisualizacaoConfiguracoes?.()">
                    <div style="text-align: center; margin-top: 8px;">
                        <strong id="qtdNumerosValue">${config.jogoSimples}</strong> <span style="font-size: 12px; color: var(--text-secondary);">números por jogo (mín ${config.minNumeros} • máx ${config.maxNumeros})</span>
                    </div>
                </div>
                <div style="flex: 1; font-size: 12px; color: #f59e0b;">
                    💡 Cada jogo terá ${config.jogoSimples} a ${config.maxNumeros} números
                </div>
            </div>
        </div>`;
    }
    
    html += `<button class="btn btn-primary" onclick="window.gerarJogos()" style="background:${config.cor}; margin-top: 20px; width: 100%; max-width: 300px; display: block; margin-left: auto; margin-right: auto;">${config.icone} GERAR JOGOS (R$ 3,00/jogo)</button>
    <div id="backtestResultados" style="margin-top:15px;"></div>
    <div id="resultados" style="margin-top:20px;"></div>
    </div>`;
    
    html += `<div class="regras-oficiais"><h4>📜 Regras</h4><p>${window.REGRAS_OFICIAIS[loteria]}</p></div>`;
    
    html += `
    <div class="footer-buttons">
        <button onclick="window.open('politica.html', '_blank')" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); border: none; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">🔒 Política</button>
        <button onclick="window.open('sobre.html', '_blank')" style="background: linear-gradient(135deg, #f59e0b, #eab308); border: none; border-radius: 30px; color: #1e293b; font-weight: 600; cursor: pointer;">📖 Sobre Nós</button>
        <button onclick="window.open('contatos.html', '_blank')" style="background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">📞 Contatos</button>
        <button onclick="window.location.href='estatisticas.html'" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); border: none; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">📊 Estatísticas</button>
    </div>
    <div style="text-align: center; margin-top: 15px; margin-bottom: 20px; font-size: 11px; color: var(--text-secondary);">
        © 2025 Loterias IA - Sistema Profissional com Inteligência Artificial | Versão 6.1 PRO
    </div>`;
    
    div.innerHTML = html;
    
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        setTimeout(() => window.atualizarVisualizacaoConfiguracoes(), 100);
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.carregarGridLoterias = carregarGridLoterias;
window.selecionarLoteria = selecionarLoteria;
window.renderizarConteudo = renderizarConteudo;
window.setPeriodo = setPeriodo;
window.atualizarDispersao = atualizarDispersao;
window.getFiltrosAtivos = getFiltrosAtivos;
window.filtrarDados = filtrarDados;
window.importarArquivo = importarArquivo;
window.processarCSV = processarCSV;
window.atualizarAnimacaoTreinamento = atualizarAnimacaoTreinamento;
window.limparResultados = limparResultados;
window.toggleModoBolao = toggleModoBolao;
window.atualizarQuantidadeNumerosBolao = atualizarQuantidadeNumerosBolao;

window.loteriaAtual = () => loteriaAtual;
window.dadosAtuais = () => dadosAtuais;
window.iaTreinada = () => iaTreinada;
window.aiModel = () => aiModel;
window.filtrosTreinamento = () => filtrosTreinamento;
window.dispersaoAtual = () => dispersaoAtual;
window.periodoSelecionado = () => periodoSelecionado;

window.setIaTreinada = (val) => { iaTreinada = val; };
window.setAiModel = (model) => { aiModel = model; };
window.setFiltrosTreinamento = (filtros) => { filtrosTreinamento = filtros; };
window.setIsTraining = (val) => { isTraining = val; };
window.setDadosAtuais = (dados) => { dadosAtuais = dados; };
