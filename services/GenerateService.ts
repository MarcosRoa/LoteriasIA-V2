// services/GenerateService.ts
// ============================================
// VERSÃO CORRIGIDA - ESTORNO APENAS SE IA FALHAR
// ============================================

import { CreditsService } from './CreditsService';
import { GameRepository } from '../repositories/GameRepository';
import { RailwayClient } from '../clients/RailwayClient';
import { getLotteryConfig, isValidLottery } from '../shared/lotteries';
import { env } from '../core/config/env';

export interface GenerateRequest {
    uid: string;
    lottery: string;
    quantity: number;
    method?: string;
    extraNumbers?: number;
    filters?: any;
}

export interface GenerateResponse {
    games: number[][];
    creditsSpent: number;
    creditsRemaining: number;
    mode: string;
    engineName: string;
    confidence: number;
    explanation: string[];
}

export class GenerateService {
    private creditsService: CreditsService;
    private gameRepository: GameRepository;
    private railwayClient: RailwayClient;

    constructor() {
        this.creditsService = new CreditsService();
        this.gameRepository = new GameRepository();
        this.railwayClient = new RailwayClient();
    }

    async generateGames(request: GenerateRequest): Promise<GenerateResponse> {
        const { uid, lottery, quantity, method = 'hybrid', extraNumbers = 0, filters = {} } = request;

        console.log(`🔍 GenerateService: uid=${uid}, lottery=${lottery}, quantity=${quantity}`);

        // ============================================
        // 1. VALIDAR LOTERIA
        // ============================================
        if (!isValidLottery(lottery)) {
            throw new Error(`Loteria inválida: ${lottery}`);
        }

        const config = getLotteryConfig(lottery)!;

        // ============================================
        // 2. BUSCAR SALDO
        // ============================================
        const { credits, isPro } = await this.creditsService.getBalance(uid);
        const numerosPorJogo = extraNumbers || config.numerosPorJogo;
        const custoPorJogo = isPro ? env.proCostPerGame : env.costPerGame;
        const custoTotal = quantity * custoPorJogo;

        console.log(`💰 Saldo: ${credits}, Custo: ${custoTotal}, PRO: ${isPro}`);

        // ============================================
        // 3. VALIDAR SALDO
        // ============================================
        if (custoTotal > 0 && credits < custoTotal) {
            throw new Error(`Saldo insuficiente: ${credits} < ${custoTotal}`);
        }

        // ============================================
        // 4. RESERVAR CRÉDITOS
        // ============================================
        const referenceId = `${lottery}_${Date.now()}_${uid}`;
        let novoSaldo = credits;

        if (custoTotal > 0) {
            novoSaldo = await this.creditsService.reserveCredits(uid, custoTotal, referenceId);
            console.log(`🔒 Créditos reservados: ${custoTotal}, Saldo: ${novoSaldo}`);
        }

        // ============================================
        // 5. CHAMAR RAILWAY (IA)
        // ============================================
        let result;
        try {
            result = await this.railwayClient.generateGames({
                lotteryType: lottery,
                count: quantity,
                method: method,
                isPro: isPro,
                extraNumbers: numerosPorJogo,
                filters
            });
        } catch (error) {
            // ✅ SÓ ESTORNA SE A IA FALHAR
            console.error('❌ Railway falhou:', error);
            
            if (custoTotal > 0) {
                try {
                    await this.creditsService.refundReservation(uid, custoTotal, referenceId);
                    console.log(`↩️ Reserva estornada: ${custoTotal}`);
                } catch (refundError) {
                    console.error('❌ Erro ao estornar:', refundError);
                }
            }
            throw error;
        }

        console.log(`✅ ${result.games?.length || 0} jogos gerados`);

        // ============================================
        // 6. CONFIRMAR RESERVA (APÓS IA OK)
        // ============================================
        if (custoTotal > 0) {
            await this.creditsService.confirmReservation(uid, custoTotal, referenceId);
            console.log(`✅ Desconto confirmado: ${custoTotal}`);
        }

        // ============================================
        // 7. SALVAR HISTÓRICO (NÃO ESTORNA SE FALHAR)
        // ============================================
        const jogos = result.games || [];
        if (jogos.length > 0) {
            try {
                await this.gameRepository.saveMany(uid, lottery, jogos, method, numerosPorJogo, custoPorJogo);
                console.log(`📝 ${jogos.length} jogos salvos`);
            } catch (saveError) {
                // ⚠️ NÃO ESTORNAR! O usuário já recebeu os jogos
                console.error('❌ Erro ao salvar histórico:', saveError);
                // Apenas log, não estorna
            }
        }

        // ============================================
        // 8. RETORNAR RESPOSTA
        // ============================================
        return {
            games: jogos,
            creditsSpent: custoTotal,
            creditsRemaining: novoSaldo,
            mode: method,
            engineName: result.engineName || 'IA',
            confidence: result.confidence || 0,
            explanation: result.explanation || []
        };
    }
}
