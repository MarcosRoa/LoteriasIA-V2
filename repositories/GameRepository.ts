// repositories/GameRepository.ts
import { supabase, JogoGerado } from '../core/database/supabase';

export class GameRepository {
    async save(userUid: string, lottery: string, numbers: number[], mode: string, extraNumbers: number, cost: number): Promise<JogoGerado> {
        const { data, error } = await supabase
            .from('historico_palpites')
            .insert({
                usuario_uid: userUid,
                loteria: lottery,
                jogos: numbers,
                modo: mode,
                quantidade_numeros: extraNumbers,
                custo: cost,
                created_at: new Date().toISOString()
            })
            .select('*')
            .single();
        
        if (error) throw error;
        return data;
    }

    async findHistory(userUid: string, limit: number = 50): Promise<JogoGerado[]> {
        const { data, error } = await supabase
            .from('historico_palpites')
            .select('*')
            .eq('usuario_uid', userUid)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    }
}
