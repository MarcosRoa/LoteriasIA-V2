// api/user/history.ts
// api/user/history.ts  13/08/2026
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Normaliza campos que podem chegar do Supabase
 * como objeto JSON ou como string contendo JSON.
 *
 * Não utiliza fallback silencioso:
 * se uma string não for um JSON válido, lança erro.
 */
function parseJsonField(
    value: unknown,
    fieldName: string,
    recordId: string
): unknown {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'object') {
        return value;
    }

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            throw new Error(
                `Campo "${fieldName}" inválido no histórico ${recordId}: JSON inválido`
            );
        }
    }

    throw new Error(
        `Campo "${fieldName}" inválido no histórico ${recordId}: tipo não suportado (${typeof value})`
    );
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    const auth = await authenticate(req, res);
    if (!auth) return;
    
    const { uid } = auth;
    
    const limit = parseInt(req.query.limit as string) || 50;

    try {
        const { data: history, error } = await supabase
            .from('historico_palpites')
            .select('*')
            .eq('usuario_uid', uid)
            .order('data', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        // Formatar os dados para o app/site
        const formattedHistory = history?.map((item: any) => ({
            id: item.id,
            loteria: item.loteria,
            data: item.data,
            jogos: item.jogos || [],
            filtros: item.filtros || item.modo || 'IA Especialista',
            quantidade_numeros: item.quantidade_numeros || 0,

            // Normalização dos campos extras
            extras: parseJsonField(
                item.extras,
                'extras',
                item.id
            ),

            meses: parseJsonField(
                item.meses,
                'meses',
                item.id
            ),

            times: parseJsonField(
                item.times,
                'times',
                item.id
            )
        })) || [];

        return res.status(200).json({
            success: true,
            history: formattedHistory
        });

    } catch (error: any) {
        console.error(
            'Erro ao buscar histórico:',
            error
        );

        return res.status(500).json({
            error: error.message
        });
    }
}
