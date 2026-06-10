// middleware/rateLimit.ts
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
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
