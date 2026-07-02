// api/generate/LotteryEngine.ts
// ============================================
// MOTOR DE LOTERIAS - RESPONSAVEL POR TODAS AS REGRAS
// ============================================

import { AdvancedLotteryAI } from './AdvancedLotteryAI';

export interface LotteryEngineConfig {
    nome: string;
    maxNumero: number;
    numerosPadrao: number;
    incluirZero: boolean;
    temDispersao: boolean;
    temTime?: boolean;
    temTrevos?: boolean;
    temMes?: boolean;
    isSuperSete?: boolean;
    isLoteca?: boolean;
}

export interface JogoGerado {
    numeros: number[];
    timeCoracao?: string;
    trevos?: number[];
    mesSorte?: number;
    colunas?: number[][];
    lotecaResultados?: string[];
    padrao?: string;
    confianca?: number;
    explicacao?: string;
}

export class LotteryEngine {
    private config: LotteryEngineConfig;
    private dados: number[][];
    private ai: AdvancedLotteryAI | null = null;
    private TIMES: string[] = [
        'Flamengo/RJ', 'Corinthians/SP', 'Palmeiras/SP', 'São Paulo/SP', 'Santos/SP',
        'Vasco/RJ', 'Fluminense/RJ', 'Botafogo/RJ', 'Cruzeiro/MG', 'Atlético/MG',
        'Grêmio/RS', 'Internacional/RS', 'Bahia/BA', 'Vitória/BA', 'Sport/PE',
        'Náutico/PE', 'Santa Cruz/PE', 'Fortaleza/CE', 'Ceará/CE', 'Paysandu/PA',
        'Remo/PA', 'Goiás/GO', 'Vila Nova/GO', 'Atlético/GO', 'Brasiliense/DF'
    ];
    private MESES: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    constructor(dados: number[][], config: LotteryEngineConfig) {
        this.dados = dados;
        this.config = config;
        
        // Inicializar IA se tiver dados suficientes
        if (dados.length >= 10) {
            try {
                this.ai = new AdvancedLotteryAI(dados, {
                    nome: config.nome,
                    maxNumero: config.maxNumero,
                    numerosPorJogo: config.numerosPadrao,
                    incluirZero: config.incluirZero,
                    temDispersao: config.temDispersao
                });
                this.ai.treinar();
                console.log(`✅ LotteryEngine: IA carregada para ${config.nome}`);
            } catch (error) {
                console.error('❌ Erro ao carregar IA:', error);
                this.ai = null;
            }
        } else {
            console.log(`⚠️ Dados insuficientes (${dados.length}), IA não carregada`);
        }
    }

    /**
     * Gera jogos completos
     */
    gerarJogos(
        quantidade: number,
        modo: string = 'ia_especialista',
        seed: number = 0,
        dispersao: number = 15
    ): JogoGerado[] {
        
        const jogos: JogoGerado[] = [];
        
        for (let i = 0; i < quantidade; i++) {
            const jogo = this.gerarJogo(modo, seed + i, dispersao);
            jogos.push(jogo);
        }
        
        console.log(`✅ ${jogos.length} jogos gerados para ${this.config.nome} (modo: ${modo})`);
        return jogos;
    }

    /**
     * Gera um único jogo completo
     */
    private gerarJogo(modo: string, seed: number, dispersao: number): JogoGerado {
        
        // ============================================
        // SUPERSETE - 7 colunas com números 0-9
        // ============================================
        if (this.config.isSuperSete) {
            return this.gerarSuperSete(seed, modo);
        }
        
        // ============================================
        // LOTECA - 14 jogos com resultados 1, X, 2
        // ============================================
        if (this.config.isLoteca) {
            return this.gerarLoteca(seed);
        }
        
        // ============================================
        // LOTERIAS NORMAIS - Gerar números
        // ============================================
        const numeros = this.gerarNumeros(modo, seed, dispersao);
        const jogo: JogoGerado = { numeros };
        
        // ============================================
        // TIMEMANIA - Adicionar Time do Coração
        // ============================================
        if (this.config.temTime) {
            jogo.timeCoracao = this.gerarTime(seed);
        }
        
        // ============================================
        // +MILIONÁRIA - Adicionar Trevos
        // ============================================
        if (this.config.temTrevos) {
            jogo.trevos = this.gerarTrevos(seed);
        }
        
        // ============================================
        // DIA DE SORTE - Adicionar Mês da Sorte
        // ============================================
        if (this.config.temMes) {
            jogo.mesSorte = this.gerarMes(seed);
        }
        
        return jogo;
    }

    /**
     * Gera números usando IA ou aleatório
     */
    private gerarNumeros(modo: string, seed: number, dispersao: number): number[] {
        const quantidade = this.config.numerosPadrao;
        
        // Se não tem IA ou modo não usa IA
        if (!this.ai) {
            console.log('⚠️ IA não disponível, usando aleatório');
            return this.gerarAleatorio(quantidade);
        }
        
        try {
            let usarDispersao = this.config.temDispersao;
            let windowDispersao = dispersao;
            
            // Modos que não usam dispersão
            if (modo === 'aleatorio_inteligente' || modo === 'probabilistico') {
                usarDispersao = false;
                windowDispersao = 0;
            }
            
            // Modo padrão (ia_especialista) usa tudo
            if (modo === 'ia_especialista') {
                usarDispersao = true;
                windowDispersao = dispersao;
            }
            
            return this.ai.predizerIAEspecialista(
                quantidade,
                usarDispersao,
                windowDispersao,
                seed
            );
        } catch (error) {
            console.error('❌ Erro na IA, usando fallback:', error);
            return this.gerarAleatorio(quantidade);
        }
    }

    /**
     * Gera números aleatórios (fallback)
     */
    private gerarAleatorio(quantidade: number): number[] {
        const numeros = new Set<number>();
        const min = this.config.incluirZero ? 0 : 1;
        const max = this.config.maxNumero;
        
        let tentativas = 0;
        while (numeros.size < quantidade && tentativas < 1000) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            numeros.add(num);
            tentativas++;
        }
        
        return Array.from(numeros).sort((a, b) => a - b);
    }

    /**
     * Gera um Time do Coração (Timemania)
     */
    private gerarTime(seed: number): string {
        const index = (seed + Math.floor(Math.random() * this.TIMES.length)) % this.TIMES.length;
        return this.TIMES[index];
    }

    /**
     * Gera 2 Trevos (+Milionária)
     */
    private gerarTrevos(seed: number): number[] {
        const trevos = new Set<number>();
        let tentativas = 0;
        while (trevos.size < 2 && tentativas < 100) {
            trevos.add(Math.floor(Math.random() * 6) + 1);
            tentativas++;
        }
        return Array.from(trevos).sort((a, b) => a - b);
    }

    /**
     * Gera um Mês (Dia de Sorte)
     */
    private gerarMes(seed: number): number {
        const index = (seed + Math.floor(Math.random() * this.MESES.length)) % this.MESES.length;
        return this.MESES[index];
    }

    /**
     * Gera um jogo da Super Sete
     */
    private gerarSuperSete(seed: number, modo: string): JogoGerado {
        const colunas: number[][] = [];
        
        for (let c = 0; c < 7; c++) {
            const numeros = new Set<number>();
            let tentativas = 0;
            while (numeros.size < 1 && tentativas < 20) {
                numeros.add(Math.floor(Math.random() * 10));
                tentativas++;
            }
            colunas.push(Array.from(numeros));
        }
        
        return {
            numeros: colunas.flat(),
            colunas: colunas
        };
    }

    /**
     * Gera um jogo da Loteca
     */
    private gerarLoteca(seed: number): JogoGerado {
        const resultados: string[] = [];
        const opcoes = ['1', 'X', '2'];
        
        for (let i = 0; i < 14; i++) {
            const idx = (seed + i + Math.floor(Math.random() * 3)) % 3;
            resultados.push(opcoes[idx]);
        }
        
        return {
            numeros: [],
            lotecaResultados: resultados
        };
    }

    /**
     * Retorna relatório da IA
     */
    getRelatorio() {
        return this.ai ? this.ai.gerarRelatorio() : {
            confiancaGeral: 0,
            totalDados: this.dados.length,
            loteria: this.config.nome,
            treinado: false
        };
    }

    /**
     * Verifica se a IA está disponível
     */
    isIADisponivel(): boolean {
        return this.ai !== null && this.ai.treinado;
    }
}
