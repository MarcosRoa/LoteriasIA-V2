// services/CreditsService.ts
import { UserRepository } from '../repositories/UserRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { env } from '../core/config/env';

export class CreditsService {
    private userRepo: UserRepository;
    private transactionRepo: TransactionRepository;

    constructor() {
        this.userRepo = new UserRepository();
        this.transactionRepo = new TransactionRepository();
    }

    async getBalance(uid: string): Promise<{ credits: number; isPro: boolean }> {
        let user = await this.userRepo.findByUid(uid);
        if (!user) {
            user = await this.userRepo.create(uid, `${uid}@temp.com`, 'Usuário');
        }
        
        const isProFixed = user.email === env.proFixedEmail;
        let isPro = user.is_pro || isProFixed;
        let credits = user.creditos;
        
        if (isProFixed && credits !== env.proCredits) {
            await this.userRepo.updateCredits(uid, env.proCredits);
            credits = env.proCredits;
            isPro = true;
        }
        
        return { credits, isPro };
    }

    async addCredits(uid: string, amount: number, referenceId?: string): Promise<number> {
        const { credits } = await this.getBalance(uid);
        const newBalance = credits + amount;
        await this.userRepo.updateCredits(uid, newBalance);
        await this.transactionRepo.create({
            usuario_uid: uid,
            tipo: 'compra',
            quantidade: amount,
            saldo_apos: newBalance,
            reference_id: referenceId || null,
            metadata: { source: 'api' }
        });
        return newBalance;
    }

    async deductCredits(uid: string, amount: number, referenceId?: string): Promise<number> {
        const { credits } = await this.getBalance(uid);
        if (credits < amount) throw new Error('Saldo insuficiente');
        const newBalance = credits - amount;
        await this.userRepo.updateCredits(uid, newBalance);
        await this.transactionRepo.create({
            usuario_uid: uid,
            tipo: 'uso',
            quantidade: amount,
            saldo_apos: newBalance,
            reference_id: referenceId || null,
            metadata: { source: 'api' }
        });
        return newBalance;
    }
}
