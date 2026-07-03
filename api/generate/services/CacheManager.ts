// ============================================
// CAMINHO: api/generate/services/CacheManager.ts
// ============================================
// Gerenciador de cache para estatísticas
// ============================================

import { StatisticsContext } from './StatisticsContext';

interface CacheEntry {
    context: StatisticsContext;
    timestamp: number;
    lastAccess: number;
}

export class CacheManager {
    private cache: Map<string, CacheEntry> = new Map();
    private maxAge: number = 3600000; // 1 hora

    /**
     * Obtém o contexto do cache ou cria um novo
     */
    getContext(lottery: string, dados: number[][], dadosExtras?: any[]): StatisticsContext {
        const key = this.generateKey(lottery, dados, dadosExtras);
        
        // Verificar se existe no cache
        if (this.cache.has(key)) {
            const entry = this.cache.get(key)!;
            entry.lastAccess = Date.now();
            
            // Verificar se ainda é válido
            if (Date.now() - entry.timestamp < this.maxAge) {
                console.log(`✅ Cache hit para ${lottery}`);
                return entry.context;
            } else {
                console.log(`⏰ Cache expirado para ${lottery}`);
                this.cache.delete(key);
            }
        }

        // Criar novo contexto
        console.log(`🆕 Criando novo contexto para ${lottery}`);
        const context = new StatisticsContext(dados);
        
        this.cache.set(key, {
            context,
            timestamp: Date.now(),
            lastAccess: Date.now()
        });

        return context;
    }

    /**
     * Gera chave única para o cache
     */
    private generateKey(lottery: string, dados: number[][], dadosExtras?: any[]): string {
        const dataHash = this.hashDados(dados);
        const extrasHash = dadosExtras ? JSON.stringify(dadosExtras) : '';
        return `${lottery}-${dataHash}-${extrasHash}`;
    }

    /**
     * Gera hash dos dados
     */
    private hashDados(dados: number[][]): string {
        let hash = 0;
        for (const jogo of dados) {
            for (const num of jogo) {
                hash = ((hash << 5) - hash) + num;
                hash = hash & hash; // Converte para inteiro de 32 bits
            }
        }
        return hash.toString(36);
    }

    /**
     * Limpa o cache
     */
    clear(): void {
        this.cache.clear();
        console.log('🧹 Cache limpo');
    }

    /**
     * Remove entradas antigas do cache
     */
    cleanup(): void {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache) {
            if (now - entry.lastAccess > this.maxAge * 2) {
                this.cache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            console.log(`🧹 ${removed} entradas removidas do cache`);
        }
    }

    /**
     * Define o tempo máximo de vida do cache (em ms)
     */
    setMaxAge(ms: number): void {
        this.maxAge = ms;
    }

    /**
     * Retorna estatísticas do cache
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton
export const cacheManager = new CacheManager();
