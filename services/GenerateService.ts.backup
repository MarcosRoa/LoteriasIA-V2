// services/GenerateService.ts
import { AdvancedLotteryAI, LotteryConfig } from '../core/ia/AdvancedLotteryAI';
import { CreditsService } from './CreditsService';
import { GameRepository } from '../repositories/GameRepository';
import { env } from '../core/config/env';

const LOTTERY_CONFIGS: Record<string, LotteryConfig> = {
    megasena: { nome: 'Mega-Sena', maxNumero: 60, numerosPorJogo: 6, incluirZero: false, temDispersao: true },
    quina: { nome: 'Quina', maxNumero: 80, numerosPorJogo: 5, incluirZero: false, temDispersao: true },
    lotofacil: { nome: 'Lotofácil', maxNumero: 25, numerosPorJogo: 15, incluirZero: false, temDispersao: true },
    lotomania: { nome: 'Lotomania', maxNumero: 99, numerosPorJogo: 50, incluirZero: true, temDispersao: true },
    duplasena: { nome: 'Dupla Sena', maxNumero: 50, numerosPorJogo: 6, incluirZero: false, temDispersao: true },
    timemania: { nome: 'Timemania', maxNumero: 80, numerosPorJogo: 10, incluirZero: false, temDispersao: true },
    milionaria: { nome: '+Milionária', maxNumero: 50, numerosPorJogo: 6, incluirZero: false, temDispersao: true },
    loteca: { nome: 'Loteca', maxNumero: 3, numerosPorJogo: 14, incluirZero: true, temDispersao: true },
    diadesorte: { nome: 'Dia de Sorte', maxNumero: 31, numerosPorJogo: 7, incluirZero: false, temDispersao: true },
    supersete: { nome: 'Super Sete', maxNumero: 9, numerosPorJogo: 7, incluirZero: true, temDispersao: true }
};

export class GenerateService {
    private creditsService: CreditsService;
    private gameRepository: GameRepository;

    constructor() {
        this.creditsService = new CreditsService();
        this.gameRepository = new GameRepository();
    }

    async generateGames(uid: string, lottery: string, quantity: number, extraNumbers?: number, mode: string = 'ia_especialista') {
        const config = LOTTERY_CONFIGS[lottery];
        if (!config) {
            throw new Error('Loteria inválida');
        }
        
        const { credits, isPro } = await this.creditsService.getBalance(uid);
        const numerosPorJogo = extraNumbers || config.numerosPorJogo;
        const custoPorJogo = isPro ? env.proCostPerGame : env.costPerGame;
        const custoTotal = quantity * custoPorJogo;
        
        if (custoTotal > 0 && credits < custoTotal) {
            throw new Error('Saldo insuficiente');
        }
        
        // Carregar dados históricos (simplificado)
        const historico: number[][] = [];
        // TODO: Buscar dados do CSV
        
        const ai = new AdvancedLotteryAI(historico, config);
        ai.treinar();
        
        const jogos: number[][] = [];
        for (let i = 0; i < quantity; i++) {
            const numeros = ai.predizerIAEspecialista(numerosPorJogo, config.temDispersao, 15, i);
            jogos.push(numeros);
        }
        
        // Atualizar créditos
        let novoSaldo = credits;
        if (custoTotal > 0) {
            novoSaldo = await this.creditsService.deductCredits(uid, custoTotal, `${lottery}_${Date.now()}`);
        }
        
        // Salvar histórico
        for (const jogo of jogos) {
            await this.gameRepository.save(uid, lottery, jogo, mode, numerosPorJogo, custoPorJogo);
        }
        
        return {
            games: jogos,
            creditsSpent: custoTotal,
            creditsRemaining: novoSaldo
        };
    }
}
