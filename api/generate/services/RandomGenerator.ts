// ============================================
// CAMINHO: api/generate/services/RandomGenerator.ts
// ============================================
// Gerador de números aleatórios com seed (Mulberry32)
// ============================================

export class RandomGenerator {
    private seed: number;

    constructor(seed: number = 0) {
        this.seed = seed;
    }

    /**
     * Gera o próximo número pseudoaleatório (0-1)
     * Implementação do Mulberry32 (mais estável que Math.sin)
     */
    next(seed?: number): number {
        if (seed !== undefined) {
            this.seed = seed;
        }

        let z = (this.seed += 0x6D2B79F5);
        z = Math.imul(z ^ (z >>> 15), z | 1);
        z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
        return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Gera um número inteiro entre min e max (inclusive)
     */
    nextInt(min: number, max: number, seed?: number): number {
        return Math.floor(this.next(seed) * (max - min + 1)) + min;
    }

    /**
     * Gera um número entre min e max (inclusive)
     */
    nextFloat(min: number, max: number, seed?: number): number {
        return this.next(seed) * (max - min) + min;
    }

    /**
     * Gera um array de números aleatórios
     */
    nextArray(quantidade: number, min: number, max: number, seed?: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < quantidade; i++) {
            result.push(this.nextInt(min, max, seed !== undefined ? seed + i : undefined));
        }
        return result;
    }

    /**
     * Gera um conjunto de números únicos
     */
    nextUnique(quantidade: number, min: number, max: number, seed?: number): Set<number> {
        const result = new Set<number>();
        let tentativas = 0;
        while (result.size < quantidade && tentativas < 1000) {
            const num = this.nextInt(min, max, seed !== undefined ? seed + tentativas : undefined);
            result.add(num);
            tentativas++;
        }
        return result;
    }

    /**
     * Gera um array de números únicos (ordenado)
     */
    nextUniqueSorted(quantidade: number, min: number, max: number, seed?: number): number[] {
        const result = this.nextUnique(quantidade, min, max, seed);
        return Array.from(result).sort((a, b) => a - b);
    }

    /**
     * Reinicia o gerador com um novo seed
     */
    reset(seed: number): void {
        this.seed = seed;
    }

    /**
     * Retorna o seed atual
     */
    getSeed(): number {
        return this.seed;
    }
}
