// ============================================
// CAMINHO: src/core/config/constants.ts
// ============================================
// CONSTANTES DE NEGÓCIO - FONTE ÚNICA
// ============================================

export const CONSTANTS = {
    // ============================================
    // PLANO PRO
    // ============================================
    PRO_DURATION_DAYS: 15,           // Trial e renovação
    TRIAL_CREDITS: 6,
    PRO_FIXED_CREDITS: 100,
    PRO_FIXED_EMAIL: 'mresquadriasaluminio@gmail.com',

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
    DEFAULT_CREDITS: 5
} as const;
