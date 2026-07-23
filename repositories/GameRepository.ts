// repositories/GameRepository.ts
// ============================================
// VERSÃO CORRIGIDA - COM saveMany()
// ============================================

import { supabase, JogoGerado } from '../core/database/supabase.js';

export class GameRepository {
    async save(userUid: string, lottery: string, numbers: number[], mode: string, extraNumbers: number, cost: number): Promise<JogoGerado> {
        const { data, error } = await supabase
            .from('historico_palpites')
            .insert({
                usuario_uid: userUid,
                loteria: lottery,
                jogos: numbers,
                //modo: mode,
                quantidade_numeros: extraNumbers,
                //custo: cost,
                created_at: new Date().toISOString()
            })
            .select('*')
            .single();
        
        if (error) throw error;
        return data;
    }

    // ✅ SALVAR EM LOTE
    async saveMany(userUid: string, lottery: string, games: number[][], mode: string, extraNumbers: number, cost: number): Promise<JogoGerado[]> {
        if (!games || games.length === 0) return [];

        const records = games.map(numbers => ({
            usuario_uid: userUid,
            loteria: lottery,
            jogos: numbers,
            modo: mode,
            quantidade_numeros: extraNumbers,
            custo: cost,
            created_at: new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from('historico_palpites')
            .insert(records)
            .select('*');

        if (error) throw error;
        return data || [];
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
