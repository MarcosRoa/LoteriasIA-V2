// repositories/TransactionRepository.ts
import { supabase, Transacao } from '../core/database/supabase';

export class TransactionRepository {
    async create(transaction: Omit<Transacao, 'id' | 'created_at'>): Promise<Transacao> {
        const { data, error } = await supabase
            .from('transacoes')
            .insert({
                usuario_uid: transaction.usuario_uid,
                tipo: transaction.tipo,
                quantidade: transaction.quantidade,
                saldo_apos: transaction.saldo_apos,
                reference_id: transaction.reference_id,
                metadata: transaction.metadata || null,
                created_at: new Date().toISOString()
            })
            .select('*')
            .single();
        if (error) throw error;
        return data;
    }

    async findByReferenceId(referenceId: string): Promise<Transacao | null> {
        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('reference_id', referenceId)
            .maybeSingle();
        if (error) throw error;
        return data;
    }
}
