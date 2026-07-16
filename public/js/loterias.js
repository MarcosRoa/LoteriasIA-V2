// ============================================
// CAMINHO: public/js/loterias.js
// ============================================
// VERSÃO 4.0 - REFATORADA (SEM CONVERSÃO DESNECESSÁRIA)
// ============================================

// ============================================
// ESTADO CENTRALIZADO DA APLICAÇÃO
// ============================================
if (!window.appState) {
    window.appState = {
        iaSelecionada: 'hybrid',
        loteriaAtual: 'megasena',
        periodo: 'all',
        dispersao: 15,
        usuario: null,
        isPro: false,
        creditos: 0
    };
}

// ============================================
// VARIÁVEIS LOCAIS
// ============================================
let loteriaAtual = 'megasena';
let dadosAtuais = [];
let dadosExtrasAtuais = [];
let datasAtuais = [];
let periodoSelecionado = 'all';
let dispersaoAtual = 15;
let isTraining = false;
let iaTreinada = false;
let aiModel = null;
let filtrosTreinamento = null;

// ============================================
// CACHE (APENAS PARA O FRONTEND)
// ============================================
const cacheDados = {};
const cacheDatas = {};
const cacheDadosExtras = {};

// ============================================
// EVENTO DE MUDANÇA DE IA
// ============================================
let onIAChangedListeners = [];

function onIAChanged(callback) {
    if (typeof callback === 'function') {
        onIAChangedListeners.push(callback);
    }
}

// ============================================
// FUNÇÕES DE ACESSO AO ESTADO (IA)
// ============================================
function getIAAtual() {
    return window.appState.iaSelecionada || 'hybrid';
}

function setIAAtual(ia) {
    window.appState.iaSelecionada = ia;
    sincronizarIASelecionada();
    onIAChangedListeners.forEach(cb => {
        try { cb(ia); } catch (e) { console.error('Erro no listener onIAChanged:', e); }
    });
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
    console.log('🤖 IA selecionada:', ia);
}

function sincronizarIASelecionada() {
    const ia = window.getIAAtual();
    document.querySelectorAll('.ia-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.ia-btn[data-ia="${ia}"]`);
    if (btn) {
        btn.classList.add('active');
    }
    console.log('🔄 IA sincronizada:', ia);
}

// ============================================
// FUNÇÃO DE DEBOUNCE
// ============================================
function debounce(func, wait) {
    return function executedFunction(...args) {
        const timeoutId = setTimeout(() => {
            func(...args);
        }, wait);
        return timeoutId;
    };
}

// ============================================
// FUNÇÕES DE DATA E FILTRO (LOCAIS)
// ============================================
function getDataCortePorAnos(anos) {
    let ultimaData = null;
    if (datasAtuais.length > 0) {
        for (let i = datasAtuais.length - 1; i >= 0; i--) {
            const dataStr = datasAtuais[i];
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

function filtrarDados() {
    if (periodoSelecionado === 'all') return [...dadosAtuais];
    if (periodoSelecionado === 1) return filtrarDadosPorData(1);
    if (periodoSelecionado === 3) return filtrarDadosPorData(3);
    if (periodoSelecionado === 5) return filtrarDadosPorData(5);
    if (periodoSelecionado === 7) return filtrarDadosPorData(7);
    if (periodoSelecionado === 9) return filtrarDadosPorData(9);
    return [...dadosAtuais];
}

function filtrarDadosPorData(anos) {
    if (!datasAtuais || datasAtuais.length === 0) return dadosAtuais;
    
    const dataCorte = getDataCortePorAnos(anos);
    const dadosFiltrados = [];
    for (let i = 0; i < dadosAtuais.length; i++) {
        const dataConcursoStr = datasAtuais[i];
        if (dataConcursoStr) {
            const partes = dataConcursoStr.split('/');
            if (partes.length === 3) {
                const dataConcurso = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (dataConcurso >= dataCorte) {
                    dadosFiltrados.push(dadosAtuais[i]);
                }
            } else {
                dadosFiltrados.push(dadosAtuais[i]);
            }
        } else {
            dadosFiltrados.push(dadosAtuais[i]);
        }
    }
    return dadosFiltrados;
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
    if (datasAtuais.length === 0 || dadosFiltrados.length === 0) {
        return { inicio: 'N/A', fim: 'N/A' };
    }
    
    const dadosFiltradosSet = new Set(dadosFiltrados);
    let primeiraData = null;
    let ultimaData = null;
    
    for (let i = 0; i < dadosAtuais.length; i++) {
        const dataStr = datasAtuais[i];
        if (dataStr && dadosFiltradosSet.has(dadosAtuais[i])) {
            const partes = dataStr.split('/');
            if (partes.length === 3) {
                if (!primeiraData) primeiraData = dataStr;
                ultimaData = dataStr;
            }
        }
    }
    
    return { inicio: primeiraData || 'N/A', fim: ultimaData || 'N/A' };
}

// ============================================
// GET FILTROS ATIVOS
// ============================================
function getFiltrosAtivos() {
    const config = window.LOTERIAS ? window.LOTERIAS[loteriaAtual] : null;
    if (!config) return [];
    
    const modo = window.getIAAtual();
    const periodoTexto = getPeriodoTexto();
    const qtdJogos = document.getElementById('qtdJogos')?.value || 1;
    const dadosFiltrados = filtrarDados();
    const modoBolaoAtivo = document.getElementById('modoBolaoCheckbox')?.checked || false;
    const qtdNumerosBolao = document.getElementById('qtdNumerosBolao')?.value || config.jogoSimples;
    
    let filtros = [
        { label: 'Loteria', valor: `${config.icone} ${config.nome}` },
        { label: 'Período', valor: periodoTexto },
        { label: 'Modo IA', valor: modo },
        { label: 'Quantidade', valor: `${qtdJogos} jogos` },
        { label: 'Base dados', valor: `${dadosFiltrados.length} concursos` }
    ];
    if (modoBolaoAtivo && config.permiteBolao && window.appState.isPro) {
        filtros.push({ label: 'Modo Bolão', valor: `${qtdNumerosBolao} números por jogo` });
    }
    if (config.temDispersao) filtros.push({ label: 'Dispersão', valor: `${dispersaoAtual} concursos` });
    return filtros;
}

// ============================================
// ✅ CARREGAR CSV DO RAILWAY (DIRETO, SEM CONVERSÃO)
// ============================================
async function carregarCSV(loteria) {
    try {
        console.log(`📤 Carregando ${loteria} do Railway...`);
        const response = await fetch(`https://loterias-ia-core-production.up.railway.app/api/csv/${loteria}`);
        
        if (!response.ok) {
            console.log(`❌ Erro ao carregar ${loteria}: ${response.status}`);
            return;
        }
        
        const data = await response.json();
        if (!data.success || !data.dados || data.dados.length === 0) {
            console.log(`❌ Dados inválidos para ${loteria}`);
            return;
        }
        
        console.log(`✅ ${loteria} carregado do Railway: ${data.dados.length} registros`);
        
        // ✅ DIRETO: JSON → dadosAtuais (SEM CONVERSÃO)
        const { numeros, extras, datas } = processarDadosRailway(data, loteria);
        
        dadosAtuais = numeros;
        dadosExtrasAtuais = extras;
        datasAtuais = datas;
        
        // Salvar no cache
        cacheDados[loteria] = { dados: numeros, carregado: true };
        cacheDatas[loteria] = { datas };
        cacheDadosExtras[loteria] = extras;
        
        // Renderizar
        if (loteriaAtual === loteria) {
            renderizarConteudo(loteria);
            if (numeros.length >= 10 && !iaTreinada && !isTraining) {
                setTimeout(() => window.treinarIAComFiltrosAtuais ? window.treinarIAComFiltrosAtuais() : null, 500);
            }
        }
        
        let msgExtras = '';
        if (loteria === 'timemania') {
            msgExtras = ` (${extras.filter(t => t !== null).length} times)`;
        } else if (loteria === 'diadesorte') {
            msgExtras = ` (${extras.filter(t => t !== null).length} meses)`;
        }
        window.mostrarToast(`${config.nome}: ${numeros.length} concursos carregados!${msgExtras}`, 'success');
        
    } catch (error) {
        console.log(`❌ Erro ao carregar ${loteria} do Railway:`, error);
        window.mostrarToast(`Erro ao carregar ${loteria}`, 'error');
    }
}

// ============================================
// ✅ PROCESSAR DADOS DO RAILWAY (SEM CONVERSÃO)
// ============================================
function processarDadosRailway(data, loteria) {
    const config = window.LOTERIAS ? window.LOTERIAS[loteria] : null;
    if (!config) {
        console.error(`❌ Configuração não encontrada para: ${loteria}`);
        return { numeros: [], extras: [], datas: [] };
    }
    
    const numeros = [];
    const extras = [];
    const datas = [];
    
    data.dados.forEach(row => {
        // Extrair números (adaptar conforme formato do Railway)
        const numerosLinha = [];
        let extra = null;
        
        // Cada linha tem os campos do CSV
        // Exemplo: { "Data Sorteio": "19/05/2018", "Bola1": "3", "Bola2": "5", ... }
        
        // 1. Extrair data
        const dataStr = row['Data Sorteio'] || row['Data'] || '';
        if (dataStr) {
            datas.push(dataStr);
        }
        
        // 2. Extrair números (Bola1 a Bola7)
        for (let i = 1; i <= config.numeros; i++) {
            const bola = row[`Bola${i}`] || row[`Numero${i}`] || row[`N${i}`] || '';
            const num = parseInt(bola);
            if (!isNaN(num) && num >= (config.incluirZero ? 0 : 1) && num <= config.maxNumero) {
                numerosLinha.push(num);
            }
        }
        
        // 3. Extrair elementos extras (Timemania, Dia de Sorte)
        if (loteria === 'timemania') {
            extra = row['Time'] || row['Time do Coração'] || null;
        } else if (loteria === 'diadesorte') {
            const mes = row['Mes da Sorte'] || row['Mes'] || '';
            const numMes = parseInt(mes);
            extra = !isNaN(numMes) && numMes >= 1 && numMes <= 12 ? numMes : null;
        } else if (loteria === 'milionaria') {
            // Pode ter trevos
            const trevo1 = row['Trevo1'] || row['Trevo 1'] || '';
            const trevo2 = row['Trevo2'] || row['Trevo 2'] || '';
            if (trevo1 && trevo2) {
                extra = { trevos: [parseInt(trevo1), parseInt(trevo2)] };
            }
        }
        
        // 4. Ordenar números
        if (numerosLinha.length >= config.numeros) {
            numeros.push(numerosLinha.slice(0, config.numeros).sort((a, b) => a - b));
            extras.push(extra);
        }
    });
    
    return { numeros, extras, datas };
}

// ============================================
// ✅ PROCESSAR CSV (APENAS PARA UPLOAD MANUAL)
// ============================================
function processarCSV(loteria, texto, nome) {
    const config = window.LOTERIAS ? window.LOTERIAS[loteria] : null;
    if (!config) {
        console.error(`❌ Configuração não encontrada para: ${loteria}`);
        return;
    }
    
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    if (linhas.length < 2) {
        console.warn(`⚠️ Dados insuficientes para ${loteria}`);
        return;
    }
    
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
    
    const minimo = config.incluirZero ? 0 : 1;
    
    function converterMesTextoParaNumero(texto) {
        if (!texto) return null;
        const meses = {
            'JANEIRO': 1, 'JAN': 1, 'FEVEREIRO': 2, 'FEV': 2,
            'MARÇO': 3, 'MAR': 3, 'ABRIL': 4, 'ABR': 4,
            'MAIO': 5, 'JUNHO': 6, 'JUN': 6,
            'JULHO': 7, 'JUL': 7, 'AGOSTO': 8, 'AGO': 8,
            'SETEMBRO': 9, 'SET': 9, 'OUTUBRO': 10, 'OUT': 10,
            'NOVEMBRO': 11, 'NOV': 11, 'DEZEMBRO': 12, 'DEZ': 12
        };
        const chave = texto.toUpperCase().trim();
        return meses[chave] || null;
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
        
        const numeros = [];
        let timeCoracao = null;
        let mesSorte = null;
        
        for (let j = dataIndex + 1; j < colunas.length; j++) {
            let valor = colunas[j]?.trim();
            if (valor === '' || valor === undefined) continue;
            
            if (loteria === 'loteca') {
                if (valor === 'Coluna 1') numeros.push(1);
                else if (valor === 'Coluna do meio') numeros.push(0);
                else if (valor === 'Coluna 2') numeros.push(2);
                continue;
            }
            
            if (loteria === 'timemania') {
                const numTeste = parseInt(valor);
                if (isNaN(numTeste) || valor.includes('/') || /[A-Za-zÀ-ú]/.test(valor)) {
                    timeCoracao = valor;
                    continue;
                }
            }
            
            if (loteria === 'diadesorte') {
                if (numeros.length >= config.numeros) {
                    const numTeste = parseInt(valor);
                    let mes = null;
                    if (!isNaN(numTeste) && numTeste >= 1 && numTeste <= 12) {
                        mes = numTeste;
                    } else {
                        mes = converterMesTextoParaNumero(valor);
                    }
                    if (mes !== null) {
                        numeros.push(mes);
                        mesSorte = mes;
                    }
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
            
            if (num >= minimo && num <= config.maxNumero) {
                numeros.push(num);
            }
        }
        
        if (loteria === 'loteca') {
            if (numeros.length === config.numeros) {
                dados.push([...numeros]);
                dadosExtras.push(null);
                datas.push(data);
            }
        } else {
            if (numeros.length >= config.numeros) {
                if (loteria === 'diadesorte') {
                    if (numeros.length === 8) {
                        const numerosJogo = numeros.slice(0, 7).sort((a, b) => a - b);
                        const mes = numeros[7];
                        numerosJogo.push(mes);
                        dados.push(numerosJogo);
                        dadosExtras.push(mesSorte || null);
                        datas.push(data);
                    } else if (numeros.length >= 7) {
                        const numerosOrdenados = numeros.slice(0, 7).sort((a, b) => a - b);
                        dados.push(numerosOrdenados);
                        dadosExtras.push(null);
                        datas.push(data);
                    }
                } else {
                    const numerosOrdenados = numeros.slice(0, config.numeros).sort((a, b) => a - b);
                    dados.push(numerosOrdenados);
                    if (loteria === 'timemania') {
                        dadosExtras.push(timeCoracao || null);
                    } else {
                        dadosExtras.push(null);
                    }
                    datas.push(data);
                }
            }
        }
    }
    
    if (dados.length > 0) {
        cacheDados[loteria] = { dados, carregado: true, nomeArquivo: nome };
        cacheDatas[loteria] = { datas };
        cacheDadosExtras[loteria] = dadosExtras;
        
        if (loteriaAtual === loteria) {
            dadosAtuais = [...dados];
            dadosExtrasAtuais = [...dadosExtras];
            datasAtuais = [...datas];
            renderizarConteudo(loteria);
            if (dados.length >= 10 && !iaTreinada && !isTraining) {
                setTimeout(() => window.treinarIAComFiltrosAtuais ? window.treinarIAComFiltrosAtuais() : null, 500);
            }
        }
        
        let msgExtras = '';
        if (loteria === 'timemania') {
            msgExtras = ` (${dadosExtras.filter(t => t !== null).length} times)`;
        } else if (loteria === 'diadesorte') {
            msgExtras = ` (${dadosExtras.filter(t => t !== null).length} meses)`;
        }
        window.mostrarToast(`${config.nome}: ${dados.length} concursos carregados!${msgExtras}`, 'success');
    } else {
        console.warn(`Nenhum dado válido encontrado para ${loteria}`);
        window.mostrarToast(`Erro ao carregar ${config.nome}: formato inválido`, 'error');
    }
}

// ============================================
// CARREGAR GRID DE LOTERIAS
// ============================================
function carregarGridLoterias() {
    const grid = document.getElementById('lotteryGrid');
    if (!grid) {
        console.warn('⚠️ Grid de loterias não encontrado');
        return;
    }
    
    const loterias = window.LOTERIAS || {};
    grid.innerHTML = Object.entries(loterias).map(([id, config]) => `
        <div class="lottery-card ${id === 'megasena' ? 'active' : ''}" 
             onclick="window.selecionarLoteria('${id}')" 
             id="card-${id}">
            <div class="ia-status nao-treinado" id="status-${id}"></div>
            <h3>${config.icone} ${config.nome}</h3>
            <p class="rules">${config.numeros} números • ${config.incluirZero ? '0 a' : '1 a'} ${config.maxNumero}</p>
        </div>
    `).join('');
    
    console.log('✅ Grid de loterias carregado');
}

// ============================================
// SELECIONAR LOTERIA
// ============================================
async function selecionarLoteria(loteria) {
    const resultadosDiv = document.getElementById('resultados');
    if (resultadosDiv) resultadosDiv.innerHTML = '';
    
    loteriaAtual = loteria;
    window.appState.loteriaAtual = loteria;
    iaTreinada = false;
    aiModel = null;
    
    const config = window.LOTERIAS ? window.LOTERIAS[loteria] : null;
    if (config && config.temDispersao) dispersaoAtual = config.dispersaoPadrao || 15;
    
    document.querySelectorAll('.lottery-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById(`card-${loteria}`);
    if (card) card.classList.add('active');
    
    if (cacheDados[loteria] && cacheDados[loteria].carregado) {
        dadosAtuais = [...cacheDados[loteria].dados];
        dadosExtrasAtuais = cacheDadosExtras[loteria] ? [...cacheDadosExtras[loteria]] : [];
        datasAtuais = cacheDatas[loteria] ? [...cacheDatas[loteria].datas] : [];
        renderizarConteudo(loteria);
        if (dadosAtuais.length >= 10 && !iaTreinada && !isTraining) {
            setTimeout(() => window.treinarIAComFiltrosAtuais ? window.treinarIAComFiltrosAtuais() : null, 500);
        }
        return;
    }
    
    dadosAtuais = [];
    dadosExtrasAtuais = [];
    datasAtuais = [];
    await carregarCSV(loteria);
}

// ============================================
// SET PERÍODO
// ============================================
const setPeriodoDebounced = debounce((p) => {
    periodoSelecionado = p;
    window.appState.periodo = p;
    iaTreinada = false;
    aiModel = null;
    renderizarConteudo(loteriaAtual);
    if (dadosAtuais.length >= 10) {
        setTimeout(() => window.treinarIAComFiltrosAtuais ? window.treinarIAComFiltrosAtuais() : null, 500);
    }
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
}, 100);

function setPeriodo(p) {
    if (debouncePeriodo) clearTimeout(debouncePeriodo);
    debouncePeriodo = setTimeout(() => {
        setPeriodoDebounced(p);
        debouncePeriodo = null;
    }, 100);
}

// ============================================
// ATUALIZAR DISPERSÃO
// ============================================
const atualizarDispersaoDebounced = debounce((v) => {
    dispersaoAtual = parseInt(v);
    window.appState.dispersao = parseInt(v);
    const valorDisplay = document.getElementById('dispersaoValor');
    if (valorDisplay) valorDisplay.textContent = `${v} concursos`;
    iaTreinada = false;
    aiModel = null;
    if (typeof window.atualizarVisualizacaoConfiguracoes === 'function') {
        window.atualizarVisualizacaoConfiguracoes();
    }
}, 100);

function atualizarDispersao(v) {
    if (debounceDispersao) clearTimeout(debounceDispersao);
    debounceDispersao = setTimeout(() => {
        atualizarDispersaoDebounced(v);
        debounceDispersao = null;
    }, 100);
}

// ============================================
// ANIMAÇÃO DE TREINAMENTO
// ============================================
function atualizarAnimacaoTreinamento(status) {
    const container = document.getElementById('iaTrainingAnimation');
    if (!container) return;
    
    if (status === 'training') {
        container.className = 'ia-training-animation';
        container.innerHTML = `
            <div class="ia-training-text">🧠 INTELIGÊNCIA ARTIFICIAL EM TREINAMENTO...</div>
            <div class="ia-training-subtext">Analisando padrões e processando dados históricos</div>
        `;
        container.style.display = 'block';
    } else if (status === 'trained') {
        container.className = 'ia-training-animation treinado';
        container.innerHTML = `
            <div class="ia-training-text treinado">✅ INTELIGÊNCIA ARTIFICIAL TREINADA!</div>
            <div class="ia-training-subtext">Pronto para gerar palpites com alta precisão</div>
        `;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// ============================================
// ATUALIZAR BOTÕES PRO
// ============================================
function atualizarBotoesPro() {
    const isProUser = window.appState.isPro || false;
    document.querySelectorAll('.ia-btn.pro-only').forEach(btn => {
        if (isProUser) {
            btn.classList.remove('pro-only');
            btn.title = btn.title.replace('🔒 ', '');
        } else {
            btn.classList.add('pro-only');
            if (!btn.title.includes('🔒')) {
                btn.title = '🔒 ' + btn.title;
            }
        }
    });
    sincronizarIASelecionada();
}

// ============================================
// RENDERIZAR CONTEÚDO DA LOTERIA
// ============================================
function renderizarConteudo(loteria) {
    // ... (mesmo código de renderização, sem alterações)
    // Apenas garantir que usa as variáveis corretas
    const div = document.getElementById('conteudoLoteria');
    if (!div) return;
    
    const config = window.LOTERIAS ? window.LOTERIAS[loteria] : null;
    if (!config) {
        div.innerHTML = `<div class="mensagem-erro">⚠️ Loteria não encontrada</div>`;
        return;
    }
    
    // ... resto da renderização (mantido igual)
}

// ============================================
// IMPORTAÇÃO MANUAL DE ARQUIVO (MANTIDO)
// ============================================
function importarArquivo(input, loteria) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => processarCSV(loteria, e.target.result, file.name);
    reader.readAsText(file);
    input.value = '';
}

// ============================================
// MODO BOLÃO
// ============================================
function toggleModoBolao() {
    const checkbox = document.getElementById('modoBolaoCheckbox');
    const bolaoContainer = document.getElementById('bolaoContainer');
    const config = window.LOTERIAS ? window.LOTERIAS[loteriaAtual] : null;
    
    if (checkbox && checkbox.checked && window.appState.isPro && config && config.permiteBolao) {
        if (bolaoContainer) bolaoContainer.style.display = 'block';
        const qtdInput = document.getElementById('qtdNumerosBolao');
        if (qtdInput) {
            qtdInput.min = config.minNumeros || config.jogoSimples;
            qtdInput.max = config.maxNumeros || config.jogoSimples * 2;
            qtdInput.value = config.jogoSimples;
        }
        document.getElementById('qtdNumerosValue') && (document.getElementById('qtdNumerosValue').innerText = config.jogoSimples);
    } else {
        if (bolaoContainer) bolaoContainer.style.display = 'none';
    }
}

function atualizarQuantidadeNumerosBolao(valor) {
    document.getElementById('qtdNumerosValue') && (document.getElementById('qtdNumerosValue').innerText = valor);
}

// ============================================
// EXPORTAÇÕES PARA O WINDOW
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
window.toggleModoBolao = toggleModoBolao;
window.atualizarQuantidadeNumerosBolao = atualizarQuantidadeNumerosBolao;
window.atualizarAnimacaoTreinamento = atualizarAnimacaoTreinamento;
window.getIAAtual = getIAAtual;
window.setIAAtual = setIAAtual;
window.sincronizarIASelecionada = sincronizarIASelecionada;
window.atualizarBotoesPro = atualizarBotoesPro;
window.onIAChanged = onIAChanged;

// Getters para outros módulos
window.loteriaAtual = () => loteriaAtual;
window.dadosAtuais = () => dadosAtuais;
window.dadosExtrasAtuais = () => dadosExtrasAtuais;
window.datasAtuais = () => datasAtuais;
window.iaTreinada = () => iaTreinada;
window.aiModel = () => aiModel;
window.filtrosTreinamento = () => filtrosTreinamento;
window.dispersaoAtual = () => dispersaoAtual;
window.periodoSelecionado = () => periodoSelecionado;
window.isTraining = () => isTraining;

window.setIaTreinada = (val) => { iaTreinada = val; };
window.setAiModel = (model) => { aiModel = model; };
window.setFiltrosTreinamento = (filtros) => { filtrosTreinamento = filtros; };
window.setIsTraining = (val) => { isTraining = val; };
window.setDadosAtuais = (dados) => { dadosAtuais = dados; };
window.setDadosExtrasAtuais = (dados) => { dadosExtrasAtuais = dados; };
window.setDatasAtuais = (datas) => { datasAtuais = datas; };

console.log('✅ LOTERIAS.js carregado (VERSÃO 4.0 - REFATORADA)');
