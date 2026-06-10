// repositories/UserRepository.ts
import { supabase, Usuario } from '../core/database/supabase';
import { env } from '../core/config/env';

export class UserRepository {
    async findByUid(uid: string): Promise<Usuario | null> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('uid', uid)
            .maybeSingle();
        
        if (error) throw error;
        return data;
    }

    async create(uid: string, email: string, nome: string): Promise<Usuario> {
        const isProFixed = email === env.proFixedEmail;
        
        const { data, error } = await supabase
            .from('usuarios')
            .insert({
                uid,
                nome,
                email,
                creditos: isProFixed ? env.proCredits : env.defaultCredits,
                is_pro: isProFixed,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('*')
            .single();
        
        if (error) throw error;
        return data;
    }

    async updateCredits(uid: string, credits: number): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .update({ creditos: credits, updated_at: new Date().toISOString() })
            .eq('uid', uid);
        
        if (error) throw error;
    }

    async updateProStatus(uid: string, isPro: boolean, expiresAt?: string): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .update({ 
                is_pro: isPro, 
                pro_expires_at: expiresAt || null,
                updated_at: new Date().toISOString()
            })
            .eq('uid', uid);
        
        if (error) throw error;
    }
}
