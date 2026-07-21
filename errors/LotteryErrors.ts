// errors/LotteryErrors.ts
// ============================================
// ERROS TIPADOS PARA NEGÓCIO
// ============================================

export class InvalidLotteryError extends Error {
    name = 'InvalidLotteryError';
    constructor(message: string) {
        super(message);
    }
}

export class InsufficientCreditsError extends Error {
    name = 'InsufficientCreditsError';
    credits: number;
    needed: number;

    constructor({ credits, needed }: { credits: number; needed: number }) {
        super(`Saldo insuficiente: ${credits} < ${needed}`);
        this.credits = credits;
        this.needed = needed;
    }
}
