export interface LotteryConfig {
    id: string;
    nome: string;
    icone: string;
    numeros: number;
    maxNumero: number;
    cor: string;
    permiteBolao: boolean;
    jogoSimples: number;
    minNumeros: number;
    maxNumeros: number;
    temDispersao: boolean;
    dispersaoPadrao: number;
    incluirZero: boolean;
}

export const LOTTERIES: LotteryConfig[] = [
    { id: 'megasena', nome: 'Mega-Sena', icone: '💰', numeros: 6, maxNumero: 60, cor: '#8b5cf6', permiteBolao: true, jogoSimples: 6, minNumeros: 6, maxNumeros: 20, temDispersao: true, dispersaoPadrao: 15, incluirZero: false },
    { id: 'quina', nome: 'Quina', icone: '🎯', numeros: 5, maxNumero: 80, cor: '#f59e0b', permiteBolao: true, jogoSimples: 5, minNumeros: 5, maxNumeros: 15, temDispersao: true, dispersaoPadrao: 10, incluirZero: false },
    { id: 'lotofacil', nome: 'Lotofácil', icone: '🍀', numeros: 15, maxNumero: 25, cor: '#10b981', permiteBolao: true, jogoSimples: 15, minNumeros: 15, maxNumeros: 20, temDispersao: true, dispersaoPadrao: 10, incluirZero: false },
    { id: 'lotomania', nome: 'Lotomania', icone: '🎪', numeros: 50, maxNumero: 99, cor: '#ef4444', permiteBolao: false, jogoSimples: 50, minNumeros: 50, maxNumeros: 50, temDispersao: true, dispersaoPadrao: 15, incluirZero: true },
    { id: 'duplasena', nome: 'Dupla Sena', icone: '🎲', numeros: 6, maxNumero: 50, cor: '#06b6d4', permiteBolao: true, jogoSimples: 6, minNumeros: 6, maxNumeros: 15, temDispersao: true, dispersaoPadrao: 10, incluirZero: false },
    { id: 'timemania', nome: 'Timemania', icone: '⚽', numeros: 10, maxNumero: 80, cor: '#ec4899', permiteBolao: false, jogoSimples: 10, minNumeros: 10, maxNumeros: 10, temDispersao: true, dispersaoPadrao: 10, incluirZero: false },
    { id: 'milionaria', nome: '+Milionária', icone: '💎', numeros: 6, maxNumero: 50, cor: '#a855f7', permiteBolao: true, jogoSimples: 6, minNumeros: 6, maxNumeros: 12, temDispersao: true, dispersaoPadrao: 12, incluirZero: false },
    { id: 'loteca', nome: 'Loteca', icone: '⚽', numeros: 14, maxNumero: 3, cor: '#84cc16', permiteBolao: false, jogoSimples: 14, minNumeros: 14, maxNumeros: 14, temDispersao: true, dispersaoPadrao: 10, incluirZero: true },
    { id: 'diadesorte', nome: 'Dia de Sorte', icone: '📅', numeros: 7, maxNumero: 31, cor: '#f97316', permiteBolao: true, jogoSimples: 7, minNumeros: 7, maxNumeros: 15, temDispersao: true, dispersaoPadrao: 8, incluirZero: false },
    { id: 'supersete', nome: 'Super Sete', icone: '🌟', numeros: 7, maxNumero: 9, cor: '#fbbf24', permiteBolao: true, jogoSimples: 7, minNumeros: 7, maxNumeros: 21, temDispersao: true, dispersaoPadrao: 7, incluirZero: true },
];
