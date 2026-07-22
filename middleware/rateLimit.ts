// middleware/rateLimit.ts
// ============================================
// RATE LIMIT - COM CONSTANTES
// ============================================

// ✅ Constantes para facilitar reuso
export const RATE_LIMIT = {
    MAX_REQUESTS: 30,
    WINDOW_MS: 60000, // 1 minuto
};

const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
    key: string,
    maxRequests: number = RATE_LIMIT.MAX_REQUESTS,
    windowMs: number = RATE_LIMIT.WINDOW_MS
): boolean {
    const now = Date.now();
    const record = rateMap.get(key);
    
    if (!record || now > record.resetAt) {
        rateMap.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    
    if (record.count >= maxRequests) {
        return false;
    }
    
    record.count++;
    rateMap.set(key, record);
    return true;
}

// ✅ Função para obter status do rate limit (útil para debug)
export function getRateLimitStatus(key: string): { remaining: number; resetIn: number } | null {
    const record = rateMap.get(key);
    if (!record) return null;
    
    const now = Date.now();
    if (now > record.resetAt) return null;
    
    return {
        remaining: RATE_LIMIT.MAX_REQUESTS - record.count,
        resetIn: record.resetAt - now
    };
}
