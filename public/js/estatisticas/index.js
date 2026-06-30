//public/js/estatisticas/index.js

// ============================================
// PONTO DE ENTRADA - ESTATÍSTICAS
// ============================================

// ============================================
// 1. IMPORTS - TODOS OS MÓDULOS
// ============================================

// Core
import * as core from './core/calculos.js';
import * as utils from './core/utils.js';

// Renderers
import * as base from './renderers/base.js';

// Loterias
import * as megasena from './loterias/megasena.js';
import * as quina from './loterias/quina.js';
import * as lotofacil from './loterias/lotofacil.js';
import * as lotomania from './loterias/lotomania.js';
import * as duplasena from './loterias/duplasena.js';
import * as timemania from './loterias/timemania.js';
import * as milionaria from './loterias/milionaria.js';
import * as loteca from './loterias/loteca.js';
import * as diadesorte from './loterias/diadesorte.js';
import * as supersete from './loterias/supersete.js';

// ============================================
// 2. MAPEAMENTO DE RENDERIZADORES
// ============================================

const RENDERIZADORES = {
    megasena: megasena.renderizar,
    quina: quina.renderizar,
    lotofacil: lotofacil.renderizar,
    lotomania: lotomania.renderizar,
    duplasena: duplasena.renderizar,
    timemania: timemania.renderizar,
    milionaria: milionaria.renderizar,
    loteca: loteca.renderizar,
    diadesorte: diadesorte.renderizar,
    supersete: supersete.renderizar
};

// ============================================
// 3. CONFIGURAÇÃO DO FIREBASE
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE",
    authDomain: "loteriasia.firebaseapp.com",
    projectId: "loteriasia",
    storageBucket: "loteriasia.firebasestorage.app",
    messagingSenderId: "124650527048",
    appId: "1:124650527048:web:bc335922cb9e1586c3fb7d"
};

// ============================================
// 4. INICIALIZAR FIREBASE
// ============================================

if (!firebase.apps || firebase.apps.length === 0) {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);
    }
}

// ============================================
// 5. CONFIGURAÇÕES DA APLICAÇÃO
// ============================================

const API_URL = 'https://loterias-ia.vercel.app/api';

let userData = {
    nome: 'Carregando...',
    email: '',
    uid: '',
    isPro: false,
    credits: 0,
    proExpiresAt: null
};

let loteriaAtualStats = 'megasena';
let periodoSelecionadoStats = 'all';
let dadosAtuaisStats = null;

// ============================================
// 6. CONFIGURAÇÕES DAS LOTERIAS
// ============================================

const LOTERIAS_STATS = {
    megasena: { nome: 'Mega-Sena', icone: '💰', numerosCSV: 6, maxNumero: 60, incluirZero: false },
    quina: { nome: 'Quina', icone: '🎯', numerosCSV: 5, maxNumero: 80, incluirZero: false },
    lotofacil: { nome: 'Lotofácil', icone: '🍀', numerosCSV: 15, maxNumero: 25, incluirZero: false },
    lotomania: { nome: 'Lotomania', icone: '🎪', numerosCSV: 20, maxNumero: 99, incluirZero: true },
    duplasena: { nome: 'Dupla Sena', icone: '🎲', numerosCSV: 6, maxNumero: 50, incluirZero: false },
    timemania: { 
        nome: 'Timemania', 
        icone: '⚽', 
        numerosCSV: 7, 
        maxNumero: 80, 
        incluirZero: false,
        temElementoExtra: true,
        nomeElemento: 'Time do Coração'
    },
    milionaria: { 
        nome: '+Milionária', 
        icone: '💎', 
        numerosCSV: 6, 
        maxNumero: 50, 
        incluirZero: false,
        temElementoExtra: true,
        nomeElemento: 'Trevo'
    },
    loteca: { nome: 'Loteca', icone: '⚽', numerosCSV: 14, maxNumero: 3, incluirZero: true },
    diadesorte: { 
        nome: 'Dia de Sorte', 
        icone: '📅', 
        numerosCSV: 7, 
        maxNumero: 31, 
        incluirZero: false,
        temElementoExtra: true,
        nomeElemento: 'Mês de Sorte'
    },
    supersete: { nome: 'Super Sete', icone: '🌟', numerosCSV: 7, maxNumero: 9, incluirZero: true }
};

// ============================================
// 7. FUNÇÃO PRINCIPAL - RENDERIZAR ESTATÍSTICAS
// ============================================

function renderizarEstatisticas(loteria, data, config, userData, periodo) {
    const renderizador = RENDERIZADORES[loteria];
    
    if (!renderizador) {
        console.warn(`⚠️ Renderizador não encontrado para: ${loteria}`);
        return base.renderizarBase(data, config, userData, periodo);
    }
    
    return renderizador(data, config, userData, periodo);
}

// ============================================
// 8. FUNÇÕES DE USUÁRIO
// ============================================

async function buscarDadosUsuario(uid) {
    try {
        const response = await fetch(`${API_URL}/user/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: uid })
        });
        
        const data = await response.json();
        console.log('📊 Resposta do /api/user/status:', data);
        
        if (data.success) {
            return {
                nome: data.user?.nome || data.user?.email?.split('@')[0] || 'Usuário',
                email: data.user?.email || '',
                isPro: data.isPro || false,
                credits: data.credits || 0,
                proExpiresAt: data.proExpiresAt || null
            };
        }
        return null;
    } catch (error) {
        console.error('❌ Erro ao buscar dados do usuário:', error);
        return null;
    }
}

function atualizarUserInfo() {
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) nameDisplay.textContent = userData.nome || 'Usuário';
    
    const creditsDisplay = document.getElementById('userCredits');
    if (creditsDisplay) creditsDisplay.textContent = userData.credits || 0;
    
    const planBadge = document.getElementById('userPlanBadge');
    if (planBadge) {
        if (userData.isPro) {
            planBadge.textContent = '⭐ PRO';
            planBadge.className = 'badge-pro';
        } else {
            planBadge.textContent = 'FREE';
            planBadge.className = 'badge-free';
        }
    }
    
    const expiresContainer = document.getElementById('proExpiresContainer');
    if (expiresContainer) {
        if (userData.isPro && userData.proExpiresAt) {
            expiresContainer.style.display = 'flex';
            const date = new Date(userData.proExpiresAt);
            const expiresDisplay = document.getElementById('userProExpires');
            if (expiresDisplay) {
                expiresDisplay.textContent = date.toLocaleDateString('pt-BR');
            }
        } else {
            expiresContainer.style.display = 'none';
        }
    }
}

function verificarUsuario() {
    firebase.auth().onAuthStateChanged(async (user) => {
        console.log('🔥 Auth state changed:', user?.email || 'null');
        
        if (user) {
            try {
                const dados = await buscarDadosUsuario(user.uid);
                
                if (dados) {
                    userData.nome = dados.nome;
                    userData.email = dados.email;
                    userData.isPro = dados.isPro;
                    userData.credits = dados.credits;
                    userData.proExpiresAt = dados.proExpiresAt;
                    userData.uid = user.uid;
                    console.log('✅ Dados carregados do backend:', userData.nome);
                } else {
                    userData.nome = user.displayName || user.email?.split('@')[0] || 'Usuário';
                    userData.email = user.email || '';
                    userData.uid = user.uid;
                    userData.isPro = false;
                    userData.credits = 0;
                    console.log('⚠️ Fallback: usando dados do Firebase:', userData.nome);
                }
            } catch(e) {
                console.error('❌ Erro ao verificar usuário:', e);
                userData.nome = user.displayName || user.email?.split('@')[0] || 'Usuário';
                userData.isPro = false;
                userData.credits = 0;
            }
        } else {
            userData.nome = 'Não autenticado';
            userData.isPro = false;
            userData.credits = 0;
            userData.email = '';
            userData.uid = '';
            console.log('👤 Nenhum usuário logado');
        }
        
        atualizarUserInfo();
        await carregarEstatisticas();
    });
}

// ============================================
// 9. FUNÇÕES DE CARREGAMENTO
// ============================================

async function atualizarPeriodoInfo(data) {
    const periodoTexto = periodoSelecionadoStats === 'all' 
        ? `Todos os concursos (${data.filteredDraws || data.totalDraws || 0} concursos)`
        : `${periodoSelecionadoStats} ano(s) (${data.filteredDraws || 0} concursos)`;
    
    document.getElementById('periodoInfo').innerHTML = `
        <p>📊 ${periodoTexto}</p>
        <div class="info-periodo-stats">
            <div><strong>📅 DATA INÍCIO:</strong> ${data.dataInicio || 'N/A'}</div>
            <div><strong>📅 DATA FIM:</strong> ${data.dataFim || 'N/A'}</div>
            <div><strong>📊 Total de concursos:</strong> ${data.totalDraws || 0}</div>
            <div><strong>📊 Período filtrado:</strong> ${data.filteredDraws || 0}</div>
        </div>
    `;
}

async function carregarEstatisticas() {
    const container = document.getElementById('estatisticasContent');
    container.innerHTML = '<div class="loading-stats">📊 Carregando estatísticas...</div>';
    
    try {
        const url = `${API_URL}/statistics?lottery=${loteriaAtualStats}&period=${periodoSelecionadoStats}`;
        console.log(`📥 Buscando estatísticas: ${url}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('📊 Dados recebidos:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Erro ao carregar estatísticas');
        }
        
        dadosAtuaisStats = data;
        await atualizarPeriodoInfo(data);
        
        const config = LOTERIAS_STATS[loteriaAtualStats];
        const html = renderizarEstatisticas(loteriaAtualStats, data, config, userData, periodoSelecionadoStats);
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        container.innerHTML = `
            <div class="error-stats">
                ⚠️ ${error.message || 'Erro ao carregar dados. Tente novamente mais tarde.'}
                <br><br>
                <button onclick="window.carregarEstatisticas()" style="background: #8b5cf6; border: none; padding: 8px 20px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">
                    🔄 Tentar novamente
                </button>
            </div>
        `;
    }
}

// ============================================
// 10. FUNÇÕES DE UI
// ============================================

function carregarGrid() {
    const grid = document.getElementById('lotteryGridStats');
    grid.innerHTML = Object.entries(LOTERIAS_STATS).map(([id, c]) => `
        <div class="lottery-card-stats ${id === 'megasena' ? 'active' : ''}" 
             onclick="window.selecionarLoteriaStats('${id}')" 
             id="card-stats-${id}">
            <h3>${c.icone} ${c.nome}</h3>
            <p class="rules">${c.numerosCSV} números • 1 a ${c.maxNumero}${c.temElementoExtra ? ` + ${c.nomeElemento || 'Extra'}` : ''}</p>
        </div>
    `).join('');
}

async function selecionarLoteriaStats(loteria) {
    loteriaAtualStats = loteria;
    document.querySelectorAll('.lottery-card-stats').forEach(c => c.classList.remove('active'));
    document.getElementById(`card-stats-${loteria}`)?.classList.add('active');
    await carregarEstatisticas();
}

// ============================================
// 11. INICIALIZAÇÃO
// ============================================

function init() {
    console.log('🚀 Inicializando página de estatísticas...');
    console.log('📊 Loterias disponíveis:', Object.keys(RENDERIZADORES));
    
    carregarGrid();
    
    document.querySelectorAll('.periodo-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');
            periodoSelecionadoStats = btn.dataset.periodo;
            await carregarEstatisticas();
        });
    });
    
    verificarUsuario();
}

// ============================================
// 12. EXPORTAÇÃO PARA O WINDOW
// ============================================

// Função principal
window.renderizarEstatisticas = renderizarEstatisticas;

// Funções de UI
window.selecionarLoteriaStats = selecionarLoteriaStats;
window.carregarEstatisticas = carregarEstatisticas;

// Funções de cálculo (para compatibilidade)
window.calcularFrequenciaNumeros = core.calcularFrequenciaNumeros;
window.calcularDuplasMaisSorteadas = core.calcularDuplasMaisSorteadas;
window.calcularTriplasMaisSorteadas = core.calcularTriplasMaisSorteadas;

// Funções de formatação
window.formatarNumero = utils.formatarNumero;
window.formatarDupla = utils.formatarDupla;
window.formatarTripla = utils.formatarTripla;

// Renderizadores individuais (fallback)
window.renderizarMegasena = megasena.renderizar;
window.renderizarQuina = quina.renderizar;
window.renderizarLotofacil = lotofacil.renderizar;
window.renderizarLotomania = lotomania.renderizar;
window.renderizarDuplaSena = duplasena.renderizar;
window.renderizarTimemania = timemania.renderizar;
window.renderizarMilionaria = milionaria.renderizar;
window.renderizarLoteca = loteca.renderizar;
window.renderizarDiaDeSorte = diadesorte.renderizar;
window.renderizarSuperSete = supersete.renderizar;

console.log('✅ Estatísticas carregadas com sucesso!');

// ============================================
// 13. INICIAR APÓS DOM CARREGADO
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
