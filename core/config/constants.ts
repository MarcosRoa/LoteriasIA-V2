// ============================================
// CAMINHO: core/config/constants.ts
// ============================================
// CONSTANTES DE NEGÓCIO - FONTE ÚNICA 28/07/2026
// ============================================

export const CONSTANTS = {
    // ============================================
    // PLANO PRO
    // ============================================
    PRO_DURATION_DAYS: 15,           // Trial e renovação
    TRIAL_CREDITS: 6,
    PRO_FIXED_CREDITS: 100,
    PRO_FIXED_EMAIL: 'mresquadriasaluminio@gmail.com',
    PRO_PRICE: 20,                   // R$ 20,00 (assinatura PRO)

    // ============================================
    // CUSTO POR JOGO
    // ============================================
    FREE_COST_PER_GAME: 3,
    PRO_COST_PER_GAME: 2,

    // ============================================
    // HISTÓRICO (PERFIL)
    // ============================================
    PRO_HISTORY_DAYS: 30,
    FREE_HISTORY_DAYS: 10,

    // ============================================
    // CRÉDITOS (PADRÃO)
    // ============================================
    // DEFAULT_CREDITS: 5,

    // ============================================
    // PACOTES DE CRÉDITOS
    // ============================================
    CREDIT_PACKAGES: {
        12: 12,   // R$ 12 → 12 créditos
        24: 24,   // R$ 24 → 24 créditos
        36: 36,   // R$ 36 → 36 créditos
        48: 48,   // R$ 48 → 48 créditos
        60: 60,   // R$ 60 → 60 créditos
        120: 120, // R$ 120 → 120 créditos
        180: 180, // R$ 180 → 180 créditos
        240: 240, // R$ 240 → 240 créditos
    },

    // ============================================
    // VALIDAÇÃO DE PAGAMENTOS
    // ============================================
    MIN_PAYMENT: 12,
    MAX_PAYMENT: 240,
} as const;

export type ConstantKeys = keyof typeof CONSTANTS;
