// ============================================
// CAMINHO: repositories/GameRepository.ts  24/07/2026
// ============================================
// VERSÃO SIMPLIFICADA - SALVA DIRETO EM JSONB
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
                quantidade_numeros: extraNumbers,
                filtros: JSON.stringify({ modo: mode, custo: cost }),
                data: new Date().toISOString()
            })
            .select('*')
            .single();
        
        if (error) throw error;
        return data;
    }

    // ✅ SALVAR EM LOTE - SIMPLIFICADO
    async saveMany(
        userUid: string, 
        lottery: string, 
        games: any[], 
        mode: string, 
        extraNumbers: number, 
        cost: number
    ): Promise<JogoGerado[]> {
        if (!games || games.length === 0) return [];

        const records = games.map((game) => {
            // 🔥 Extrair números (suporta array ou objeto)
            const numeros = Array.isArray(game) ? game : (game.numeros || []);

            // 🔥 Extrair extras de forma simplificada
            const extras = game?.trevos 
                ? { trevos: game.trevos } 
                : game?.extras ?? null;

            // 🔥 Extrair meses
            const meses = game?.mesSorte 
                ? [game.mesSorte] 
                : game?.meses ?? null;

            // 🔥 Extrair times
            const times = game?.timeCoracao 
                ? [game.timeCoracao] 
                : game?.times ?? null;

            return {
                usuario_uid: userUid,
                loteria: lottery,
                jogos: numeros,
                quantidade_numeros: extraNumbers,
                filtros: JSON.stringify({ modo: mode, custo: cost }),
                data: new Date().toISOString(),
                extras,  // ✅ Direto (jsonb)
                meses,   // ✅ Direto (jsonb)
                times    // ✅ Direto (jsonb)
            };
        });

        const { data, error } = await supabase
            .from('historico_palpites')
            .insert(records)
            .select('*');

        if (error) {
            console.error('❌ Erro ao salvar jogos:', error);
            throw error;
        }
        return data || [];
    }

    async findHistory(userUid: string, limit: number = 50): Promise<JogoGerado[]> {
        const { data, error } = await supabase
            .from('historico_palpites')
            .select('*')
            .eq('usuario_uid', userUid)
            .order('data', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    }
}
