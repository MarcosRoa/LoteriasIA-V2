// ============================================
// CONFIG.js - Configurações centralizadas do sistema (FASE 19)
// ============================================

const LOTERIAS = {
    megasena: { 
        nome: 'Mega-Sena', icone: '💰', numeros: 6, maxNumero: 60, cor: '#8b5cf6', 
        temDispersao: true, dispersaoPadrao: 15, dispersaoMin: 5, dispersaoMax: 25,
        minNumeros: 6, maxNumeros: 20, permiteBolao: true, jogoSimples: 6,
        incluirZero: false
    },
    quina: { 
        nome: 'Quina', icone: '🎯', numeros: 5, maxNumero: 80, cor: '#f59e0b', 
        temDispersao: true, dispersaoPadrao: 10, dispersaoMin: 3, dispersaoMax: 20,
        minNumeros: 5, maxNumeros: 15, permiteBolao: true, jogoSimples: 5,
        incluirZero: false
    },
    lotofacil: { 
        nome: 'Lotofácil', icone: '🍀', numeros: 15, maxNumero: 25, cor: '#10b981', 
        temDispersao: true, dispersaoPadrao: 10, dispersaoMin: 3, dispersaoMax: 15,
        minNumeros: 15, maxNumeros: 20, permiteBolao: true, jogoSimples: 15,
        incluirZero: false
    },
    lotomania: { 
        nome: 'Lotomania', icone: '🎪', numeros: 20, maxNumero: 99, cor: '#ef4444', 
        incluirZero: true, temDispersao: true, dispersaoPadrao: 15, dispersaoMin: 5, dispersaoMax: 30,
        minNumeros: 50, maxNumeros: 50, permiteBolao: false, jogoSimples: 50
    },
    duplasena: { 
        nome: 'Dupla Sena', icone: '🎲', numeros: 6, maxNumero: 50, cor: '#06b6d4', 
        temDispersao: true, dispersaoPadrao: 10, dispersaoMin: 3, dispersaoMax: 15,
        minNumeros: 6, maxNumeros: 15, permiteBolao: true, jogoSimples: 6,
        incluirZero: false
    },
    timemania: { 
        nome: 'Timemania', icone: '⚽', numeros: 7, maxNumero: 80, cor: '#ec4899', 
        temTime: true, temDispersao: true, dispersaoPadrao: 10, dispersaoMin: 3, dispersaoMax: 20,
        minNumeros: 10, maxNumeros: 10, permiteBolao: false, jogoSimples: 10,
        incluirZero: false
    },
    milionaria: { 
        nome: '+Milionária', icone: '💎', numeros: 6, maxNumero: 50, cor: '#a855f7', 
        temDispersao: true, dispersaoPadrao: 12, dispersaoMin: 5, dispersaoMax: 20, 
        temTrevos: true, numTrevos: 2, maxTrevo: 6,
        minNumeros: 6, maxNumeros: 12, permiteBolao: true, jogoSimples: 6,
        incluirZero: false
    },
    loteca: { 
        nome: 'Loteca', icone: '⚽', numeros: 14, maxNumero: 3, cor: '#84cc16', 
        temDispersao: true, dispersaoPadrao: 10, dispersaoMin: 3, dispersaoMax: 15,
        minNumeros: 14, maxNumeros: 14, permiteBolao: false, jogoSimples: 14,
        incluirZero: true
    },
    diadesorte: { 
        nome: 'Dia de Sorte', icone: '📅', numeros: 7, maxNumero: 31, cor: '#f97316', 
        temDispersao: true, dispersaoPadrao: 8, dispersaoMin: 3, dispersaoMax: 15, 
        temMes: true, maxMes: 12,
        minNumeros: 7, maxNumeros: 15, permiteBolao: true, jogoSimples: 7,
        incluirZero: false
    },
    supersete: { 
        nome: 'Super Sete', icone: '🌟', numeros: 7, maxNumero: 9, cor: '#fbbf24', 
        incluirZero: true, temDispersao: true, dispersaoPadrao: 7, dispersaoMin: 3, dispersaoMax: 10,
        minNumeros: 7, maxNumeros: 21, permiteBolao: true, jogoSimples: 7
    }
};

const REGRAS_OFICIAIS = {
    megasena: `<strong>Mega-Sena</strong> - 6 a 20 números (01 a 60). Valor: R$ 5,00 por jogo simples.`,
    quina: `<strong>Quina</strong> - 5 a 15 números (01 a 80). Valor: R$ 2,50 por jogo simples.`,
    lotofacil: `<strong>Lotofácil</strong> - 15 a 20 números (01 a 25). Valor: R$ 3,00 por jogo simples.`,
    lotomania: `<strong>Lotomania</strong> - 50 números (00 a 99). São sorteados 20 números. Valor: R$ 3,00.`,
    duplasena: `<strong>Dupla Sena</strong> - 6 a 15 números (01 a 50). Valor: R$ 2,50 por jogo simples.`,
    timemania: `<strong>Timemania</strong> - 10 números (01 a 80) + 1 Time do Coração. São sorteados 7 números. Valor: R$ 3,00.`,
    milionaria: `<strong>+Milionária</strong> - 6 a 12 números (01 a 50) + 2 Trevos (1 a 6). Valor: R$ 6,00 por jogo simples.`,
    loteca: `<strong>Loteca</strong> - 14 palpites (1=Time1, 2=Time2, 0=Empate). Valor: R$ 3,00.`,
    diadesorte: `<strong>Dia de Sorte</strong> - 7 a 15 números (01 a 31) + 1 Mês da Sorte (1 a 12). Valor: R$ 2,50 por jogo simples.`,
    supersete: `<strong>Super Sete</strong> - 7 colunas (0 a 9). Valor: R$ 3,00 por jogo simples.`
};

const VALORES_PIX = [12, 24, 36, 48, 60, 120, 180, 240];
const CONCURSOS_POR_ANO = {
    megasena: 52, quina: 52, lotofacil: 52, lotomania: 52,
    duplasena: 52, timemania: 52, milionaria: 52,
    loteca: 26, diadesorte: 52, supersete: 52
};

//const cacheDados = {};
//const cacheDatas = {};

Object.keys(LOTERIAS).forEach(key => { 
    cacheDados[key] = { dados: [], carregado: false, nomeArquivo: null }; 
    cacheDatas[key] = { datas: [] }; 
});

window.LOTERIAS = LOTERIAS;
window.REGRAS_OFICIAIS = REGRAS_OFICIAIS;
window.VALORES_PIX = VALORES_PIX;
window.CONCURSOS_POR_ANO = CONCURSOS_POR_ANO;
window.cacheDados = cacheDados;
window.cacheDatas = cacheDatas;
