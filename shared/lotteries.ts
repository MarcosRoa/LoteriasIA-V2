// shared/lotteries.ts
// ============================================
// CONFIGURAÇÕES DAS LOTERIAS (FONTE ÚNICA)
// ============================================

export const LOTTERY_CONFIGS = {
    megasena: { nome: 'Mega-Sena', maxNumero: 60, numerosPorJogo: 6, incluirZero: false },
    quina: { nome: 'Quina', maxNumero: 80, numerosPorJogo: 5, incluirZero: false },
    lotofacil: { nome: 'Lotofácil', maxNumero: 25, numerosPorJogo: 15, incluirZero: false },
    lotomania: { nome: 'Lotomania', maxNumero: 99, numerosPorJogo: 50, incluirZero: true },
    duplasena: { nome: 'Dupla Sena', maxNumero: 50, numerosPorJogo: 6, incluirZero: false },
    timemania: { nome: 'Timemania', maxNumero: 80, numerosPorJogo: 10, incluirZero: false },
    milionaria: { nome: '+Milionária', maxNumero: 50, numerosPorJogo: 6, incluirZero: false },
    loteca: { nome: 'Loteca', maxNumero: 3, numerosPorJogo: 14, incluirZero: true },
    diadesorte: { nome: 'Dia de Sorte', maxNumero: 31, numerosPorJogo: 7, incluirZero: false },
    supersete: { nome: 'Super Sete', maxNumero: 9, numerosPorJogo: 7, incluirZero: true }
} as const;

export type LotteryType = keyof typeof LOTTERY_CONFIGS;

export function getLotteryConfig(lottery: string) {
    return LOTTERY_CONFIGS[lottery as LotteryType] || null;
}

export function isValidLottery(lottery: string): boolean {
    return lottery in LOTTERY_CONFIGS;
}
