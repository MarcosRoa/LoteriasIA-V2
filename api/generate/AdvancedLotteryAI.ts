// api/generate/AdvancedLotteryAI.ts  02/07/2026

// api/generate/AdvancedLotteryAI.ts
// ============================================
// IA ESPECIALISTA - ANÁLISE COMPLETA
// ============================================

export interface LotteryConfig {
    nome: string;
    maxNumero: number;
    numerosPorJogo: number;
    incluirZero: boolean;
    temDispersao?: boolean;
}

export class AdvancedLotteryAI {
    private dados: number[][];
    private config: LotteryConfig;
    private frequencias: number[] = [];
    private atrasos: number[] = [];
    public treinado: boolean = false;
    public confianca: number = 0;

    constructor(dados: number[][], config: LotteryConfig) {
        this.dados = dados;
        this.config = config;
    }

    /**
     * Treina a IA com os dados históricos
     */
    treinar(): boolean {
        if (this.dados.length < 10) {
            console.log(`⚠️ Dados insuficientes para treinar (${this.dados.length} concursos)`);
            return false;
        }
        
        const limite = this.config.maxNumero + (this.config.incluirZero ? 1 : 0);
        this.frequencias = new Array(limite).fill(0);
        this.atrasos = new Array(limite).fill(this.dados.length);
        
        // Calcular frequências
        for (const jogo of this.dados) {
            for (const num of jogo) {
                if (num >= 0 && num < limite) {
                    this.frequencias[num]++;
                }
            }
        }
        
        // Calcular atrasos
        for (let i = 0; i < this.dados.length; i++) {
            for (const num of this.dados[i]) {
                if (num >= 0 && num < limite) {
                    this.atrasos[num] = 0;
                }
            }
            for (let n = 0; n < limite; n++) {
                if (this.atrasos[n] !== undefined) {
                    this.atrasos[n]++;
                }
            }
        }
        
        this.treinado = true;
        this.confianca = Math.min(95, Math.floor(this.dados.length / 10) + 50);
        console.log(`✅ IA treinada com ${this.dados.length} concursos. Confiança: ${this.confianca}%`);
        return true;
    }

    /**
     * Verifica se a IA está treinada
     */
    isTreinado(): boolean {
        return this.treinado;
    }

    /**
     * Predição com IA Especialista
     */
    predizerIAEspecialista(
        quantidade: number, 
        usarDispersao: boolean = true, 
        windowDispersao: number = 15, 
        seed: number = 0
    ): number[] {
        if (!this.treinado) {
            console.log('⚠️ IA não treinada, usando aleatório');
            return this.gerarAleatorio(quantidade);
        }
        
        const min = this.config.incluirZero ? 0 : 1;
        const limite = this.config.maxNumero + (this.config.incluirZero ? 1 : 0);
        
        // Calcular scores
        const scores: { numero: number; score: number }[] = [];
        const maxFreq = Math.max(...this.frequencias.slice(min));
        const maxAtraso = Math.max(...this.atrasos.slice(min));
        
        for (let i = min; i < limite; i++) {
            // Score de frequência (quanto menor a frequência, maior o score)
            const freqScore = maxFreq > 0 ? (1 - this.frequencias[i] / maxFreq) * 50 : 50;
            // Score de atraso (quanto maior o atraso, maior o score)
            const atrasoScore = maxAtraso > 0 ? (this.atrasos[i] / maxAtraso) * 50 : 50;
            let score = freqScore + atrasoScore;
            
            // Penalizar números que saíram recentemente (dispersão)
            if (usarDispersao && this.dados.length >= windowDispersao) {
                const recentes = new Set<number>();
                for (let j = this.dados.length - windowDispersao; j < this.dados.length; j++) {
                    for (const num of this.dados[j]) {
                        recentes.add(num);
                    }
                }
                if (recentes.has(i)) {
                    score *= 0.3;
                }
            }
            scores.push({ numero: i, score });
        }
        
        // Ordenar por score
        scores.sort((a, b) => b.score - a.score);
        
        // Selecionar os melhores
        const result = new Set<number>();
        for (const item of scores) {
            if (result.size >= quantidade) break;
            result.add(item.numero);
        }
        
        // Completar com números aleatórios se necessário
        while (result.size < quantidade) {
            const num = Math.floor(Math.random() * (limite - min)) + min;
            result.add(num);
        }
        
        return Array.from(result).sort((a, b) => a - b);
    }

    /**
     * Geração aleatória (fallback)
     */
    gerarAleatorio(quantidade: number): number[] {
        const result = new Set<number>();
        const min = this.config.incluirZero ? 0 : 1;
        const max = this.config.maxNumero;
        while (result.size < quantidade) {
            result.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(result).sort((a, b) => a - b);
    }

    /**
     * Relatório da IA
     */
    gerarRelatorio() {
        return {
            confiancaGeral: this.confianca,
            totalDados: this.dados.length,
            loteria: this.config.nome,
            treinado: this.treinado
        };
    }
}
