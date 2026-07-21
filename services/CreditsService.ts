// services/CreditsService.ts
// ============================================
// SERVIÇO DE CRÉDITOS - COM RESERVA E ESTORNO
// ============================================

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

    // ============================================
    // BUSCAR SALDO
    // ============================================
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

    // ============================================
    // 🔒 RESERVAR CRÉDITOS (ANTES DA IA)
    // ============================================
    async reserveCredits(uid: string, amount: number, referenceId: string): Promise<number> {
        const { credits } = await this.getBalance(uid);
        if (credits < amount) {
            throw new Error(`Saldo insuficiente: ${credits} < ${amount}`);
        }
        
        const newBalance = credits - amount;
        await this.userRepo.updateCredits(uid, newBalance);
        
        await this.transactionRepo.create({
            usuario_uid: uid,
            tipo: 'reserva',
            quantidade: amount,
            saldo_apos: newBalance,
            reference_id: referenceId,
            metadata: { status: 'pending' }
        });
        
        console.log(`🔒 ${amount} créditos reservados para ${uid}`);
        return newBalance;
    }

    // ============================================
    // ✅ CONFIRMAR RESERVA (APÓS IA BEM-SUCEDIDA)
    // ============================================
    async confirmReservation(uid: string, amount: number, referenceId: string): Promise<void> {
        const transaction = await this.transactionRepo.findByReferenceId(referenceId);
        if (!transaction) {
            throw new Error(`Reserva não encontrada: ${referenceId}`);
        }
        
        if (transaction.tipo !== 'reserva') {
            throw new Error(`Transação não é uma reserva: ${referenceId}`);
        }
        
        await this.transactionRepo.updateStatus(referenceId, 'confirmado');
        
        await this.transactionRepo.create({
            usuario_uid: uid,
            tipo: 'uso',
            quantidade: amount,
            saldo_apos: transaction.saldo_apos,
            reference_id: `${referenceId}_confirmed`,
            metadata: { original_reference: referenceId, status: 'confirmed' }
        });
        
        console.log(`✅ ${amount} créditos confirmados para ${uid}`);
    }

    // ============================================
    // ↩️ ESTORNAR RESERVA (SE IA FALHAR)
    // ============================================
    async refundReservation(uid: string, amount: number, referenceId: string): Promise<number> {
        const transaction = await this.transactionRepo.findByReferenceId(referenceId);
        if (!transaction) {
            throw new Error(`Reserva não encontrada: ${referenceId}`);
        }
        
        if (transaction.tipo !== 'reserva') {
            throw new Error(`Transação não é uma reserva: ${referenceId}`);
        }
        
        const { credits } = await this.getBalance(uid);
        const newBalance = credits + amount;
        await this.userRepo.updateCredits(uid, newBalance);
        
        await this.transactionRepo.create({
            usuario_uid: uid,
            tipo: 'estorno',
            quantidade: amount,
            saldo_apos: newBalance,
            reference_id: `${referenceId}_refund`,
            metadata: { original_reference: referenceId, status: 'refunded' }
        });
        
        await this.transactionRepo.updateStatus(referenceId, 'estornado');
        
        console.log(`↩️ ${amount} créditos estornados para ${uid}`);
        return newBalance;
    }

    // ============================================
    // ADICIONAR CRÉDITOS (COMPRA)
    // ============================================
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
}
