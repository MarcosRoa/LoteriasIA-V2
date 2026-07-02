//core/database/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabase = createClient(
    env.supabaseUrl,
    env.supabaseServiceKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export type Usuario = {
    id: string;
    uid: string;
    nome: string;
    email: string;
    foto_url: string | null;
    creditos: number;
    is_pro: boolean;
    pro_expires_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Transacao = {
    id: string;
    usuario_uid: string;
    tipo: 'compra' | 'uso' | 'pro_ativacao';
    quantidade: number;
    saldo_apos: number;
    reference_id: string | null;
    metadata?: any;
    created_at: string;
};

export type JogoGerado = {
    id: string;
    usuario_uid: string;
    loteria: string;
    numeros: number[];
    modo: string;
    quantidade_numeros: number;
    custo: number;
    created_at: string;
};
