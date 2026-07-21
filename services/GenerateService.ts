// services/GenerateService.ts
// ============================================
// VERSÃO 3.3 - CORRIGIDA
// ============================================

import { CreditsService } from './CreditsService';
import { GameRepository } from '../repositories/GameRepository';
import { RailwayClient } from '../clients/RailwayClient';
import { getLotteryConfig, isValidLottery } from '../../shared/lotteries';
import { env } from '../core/config/env';
import { InsufficientCreditsError, InvalidLotteryError } from '../errors/LotteryErrors';

export interface GenerateRequest {
    uid: string;
    lottery: string;
    quantity: number;
    method?: string;
    extraNumbers?: number;
    filters?: any;
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

    async generateGames(request: GenerateRequest) {
        const { uid, lottery, quantity, method = 'hybrid', extraNumbers = 0, filters = {} } = request;

        console.log(`🔍 GenerateService: uid=${uid}, lottery=${lottery}, quantity=${quantity}`);

        // ============================================
        // 1. VALIDAR LOTERIA (USANDO SHARED)
        // ============================================
        if (!isValidLottery(lottery)) {
            throw new InvalidLotteryError(`Loteria inválida: ${lottery}`);
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
            throw new InsufficientCreditsError({
                credits,
                needed: custoTotal
            });
        }

        // ============================================
        // 4. RESERVAR CRÉDITOS (REAL)
        // ============================================
        const referenceId = `${lottery}_${Date.now()}_${uid}`;
        let novoSaldo = credits;

        if (custoTotal > 0) {
            // ✅ Reserva REAL (operação atômica)
            novoSaldo = await this.creditsService.reserveCredits(uid, custoTotal, referenceId);
            console.log(`🔒 Créditos reservados: ${custoTotal}, Saldo: ${novoSaldo}`);
        }

        try {
            // ============================================
            // 5. CHAMAR RAILWAY
            // ============================================
            const result = await this.railwayClient.generateGames({
                lotteryType: lottery,
                count: quantity,
                method: method,
                isPro: isPro,
                extraNumbers: numerosPorJogo,
                filters
            });

            console.log(`✅ ${result.games?.length || 0} jogos gerados`);

            // ============================================
            // 6. CONFIRMAR DESCONTO (COMMIT)
            // ============================================
            if (custoTotal > 0) {
                await this.creditsService.confirmReservation(uid, custoTotal, referenceId);
                console.log(`✅ Desconto confirmado: ${custoTotal}`);
            }

            // ============================================
            // 7. SALVAR HISTÓRICO (EM LOTE)
            // ============================================
            const jogos = result.games || [];
            if (jogos.length > 0) {
                await this.gameRepository.saveMany(uid, lottery, jogos, method, numerosPorJogo, custoPorJogo);
                console.log(`📝 ${jogos.length} jogos salvos`);
            }

            return {
                games: jogos,
                creditsSpent: custoTotal,
                creditsRemaining: novoSaldo,
                mode: method,
                engineName: result.engineName || 'IA',
                confidence: result.confidence || 0,
                explanation: result.explanation || []
            };

        } catch (error) {
            // ============================================
            // 8. ESTORNAR RESERVA (ROLLBACK)
            // ============================================
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
    }
}
