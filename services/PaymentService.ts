import { CreditsService } from './CreditsService';
import { TransactionRepository } from '../repositories/TransactionRepository';

export class PaymentService {
    private creditsService: CreditsService;
    private transactionRepo: TransactionRepository;

    constructor() {
        this.creditsService = new CreditsService();
        this.transactionRepo = new TransactionRepository();
    }

    async simulatePayment(uid: string, amount: number): Promise<number> {
        const transaction = await this.transactionRepo.findByReferenceId(`sim_${uid}_${amount}`);
        if (transaction) {
            const { credits } = await this.creditsService.getBalance(uid);
            return credits;
        }
        
        return await this.creditsService.addCredits(uid, amount, `sim_${uid}_${amount}_${Date.now()}`);
    }
}
