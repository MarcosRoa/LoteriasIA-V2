// ============================================
// CAMINHO: src/services/ProService.ts
// ============================================
// SERVIÇO DE PLANO PRO - VERSÃO COMPLETA
// ============================================

import { CONSTANTS } from '../core/config/constants';

export interface ProUser {
    uid: string;
    is_pro: boolean;
    pro_expires_at: string | null;
    creditos: number;
    email?: string;
    nome?: string;
}

export interface ProStatus {
    isPro: boolean;
    daysLeft: number;
    expiresAt: string | null;
    needsUpdate: boolean;
}

export interface ProSyncResult extends ProStatus {
    userUpdated: boolean;
    changes: string[];
}

export class ProService {
    // ============================================
    // CALCULAR DIAS RESTANTES
    // ============================================
    static calcularDiasRestantes(expiresAt: string | null): number {
        if (!expiresAt) return 0;
        const expires = new Date(expiresAt);
        const now = new Date();
        if (expires <= now) return 0;
        return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // ============================================
    // CALCULAR NOVA EXPIRAÇÃO (RENOVAÇÃO INTELIGENTE)
    // ============================================
    static calcularNovaExpiracao(currentExpiresAt: string | null): string {
        const now = new Date();
        const duration = CONSTANTS.PRO_DURATION_DAYS;

        if (currentExpiresAt) {
            const currentExpires = new Date(currentExpiresAt);
            if (currentExpires > now) {
                // ✅ Ainda PRO → soma ao vencimento atual
                const newDate = new Date(currentExpires);
                newDate.setDate(newDate.getDate() + duration);
                return newDate.toISOString();
            }
        }

        // ✅ Já expirou ou nunca teve → conta a partir de agora
        const newDate = new Date(now);
        newDate.setDate(newDate.getDate() + duration);
        return newDate.toISOString();
    }

    // ============================================
    // VERIFICAR EXPIRAÇÃO (SEM ATUALIZAR)
    // ============================================
    static verificarExpiracao(user: ProUser): ProStatus {
        const isPro = user.is_pro || false;
        const expiresAt = user.pro_expires_at || null;
        let daysLeft = this.calcularDiasRestantes(expiresAt);

        // 🔥 Fonte da verdade: pro_expires_at
        const effectivelyPro = daysLeft > 0;

        // 🔥 Se is_pro está diferente da realidade, precisa atualizar
        const needsUpdate = isPro !== effectivelyPro;

        return {
            isPro: effectivelyPro,
            daysLeft,
            expiresAt,
            needsUpdate
        };
    }

    // ============================================
    // SINCRONIZAR STATUS PRO (FUNÇÃO PRINCIPAL)
    // ============================================
    static async sync(
        user: ProUser,
        updateUser: (data: Partial<ProUser>) => Promise<void>
    ): Promise<ProSyncResult> {
        const changes: string[] = [];
        let userUpdated = false;

        // 1. Verificar expiração
        const status = this.verificarExpiracao(user);

        // 2. Se expirou, atualizar
        if (status.needsUpdate) {
            await updateUser({
                is_pro: status.isPro
            });
            userUpdated = true;
            changes.push(`PRO ${status.isPro ? 'reativado' : 'expirado'}`);

            // 🔥 Log estruturado
            console.log({
                level: 'info',
                event: status.isPro ? 'PRO_REACTIVATED' : 'PRO_EXPIRED',
                uid: user.uid,
                daysLeft: status.daysLeft,
                expiresAt: status.expiresAt
            });
        }

        return {
            ...status,
            userUpdated,
            changes
        };
    }

    // ============================================
    // CRIAR TRIAL USER
    // ============================================
    static criarTrialUser(): {
        creditos: number;
        is_pro: boolean;
        pro_expires_at: string;
    } {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + CONSTANTS.PRO_DURATION_DAYS);

        // 🔥 Log estruturado
        console.log({
            level: 'info',
            event: 'TRIAL_CREATED',
            expiresAt: expiresAt.toISOString(),
            credits: CONSTANTS.TRIAL_CREDITS
        });

        return {
            creditos: CONSTANTS.TRIAL_CREDITS,
            is_pro: true,
            pro_expires_at: expiresAt.toISOString()
        };
    }

    // ============================================
    // RENOVAR PRO (APÓS PAGAMENTO CONFIRMADO)
    // ============================================
    static async renew(
        user: ProUser,
        updateUser: (data: Partial<ProUser>) => Promise<void>
    ): Promise<{ newExpiresAt: string; daysLeft: number }> {
        const newExpiresAt = this.calcularNovaExpiracao(user.pro_expires_at);
        const daysLeft = this.calcularDiasRestantes(newExpiresAt);

        await updateUser({
            is_pro: true,
            pro_expires_at: newExpiresAt
        });

        // 🔥 Log estruturado
        console.log({
            level: 'info',
            event: 'PRO_RENEWED',
            uid: user.uid,
            oldExpiresAt: user.pro_expires_at,
            newExpiresAt,
            daysLeft,
            durationDays: CONSTANTS.PRO_DURATION_DAYS
        });

        return { newExpiresAt, daysLeft };
    }

    // ============================================
    // VERIFICAR SE É PRO FIXO (ADMIN)
    // ============================================
    static isProFixedEmail(email: string | null | undefined): boolean {
        return email === CONSTANTS.PRO_FIXED_EMAIL;
    }
}
