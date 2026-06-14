// ============================================
// IA simplificada para mobile
// ============================================

export class SimpleLotteryAI {
    private dados: number[][];
    private maxNumero: number;
    private incluirZero: boolean;

    constructor(dados: number[][], maxNumero: number, incluirZero: boolean = false) {
        this.dados = dados;
        this.maxNumero = maxNumero;
        this.incluirZero = incluirZero;
    }

    private calcularFrequencia(): Map<number, number> {
        const freq = new Map<number, number>();
        const min = this.incluirZero ? 0 : 1;
        
        for (let i = min; i <= this.maxNumero; i++) {
            freq.set(i, 0);
        }
        
        for (const jogo of this.dados) {
            for (const num of jogo) {
                freq.set(num, (freq.get(num) || 0) + 1);
            }
        }
        
        return freq;
    }

    private calcularAtraso(): Map<number, number> {
        const atraso = new Map<number, number>();
        const min = this.incluirZero ? 0 : 1;
        
        for (let i = min; i <= this.maxNumero; i++) {
            atraso.set(i, this.dados.length);
        }
        
        for (let i = this.dados.length - 1; i >= 0; i--) {
            for (const num of this.dados[i]) {
                if (atraso.get(num) === this.dados.length) {
                    atraso.set(num, this.dados.length - 1 - i);
                }
            }
        }
        
        return atraso;
    }

    predizerIAEspecialista(quantidade: number): number[] {
        const numeros = new Set<number>();
        const min = this.incluirZero ? 0 : 1;
        
        while (numeros.size < quantidade) {
            const num = Math.floor(Math.random() * (this.maxNumero - min + 1)) + min;
            numeros.add(num);
        }
        
        return Array.from(numeros).sort((a, b) => a - b);
    }

    predizerAleatorio(quantidade: number): number[] {
        const numeros = new Set<number>();
        const min = this.incluirZero ? 0 : 1;
        
        while (numeros.size < quantidade) {
            const num = Math.floor(Math.random() * (this.maxNumero - min + 1)) + min;
            numeros.add(num);
        }
        
        return Array.from(numeros).sort((a, b) => a - b);
    }
}
