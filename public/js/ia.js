// ============================================
// IA.js - Class AdvancedLotteryAI (FASE 20 - CORREÇÃO LOTECA + TIMEMANIA)
// ============================================

class AdvancedLotteryAI {
    constructor(dados, maxNumero, loteriaNome, dadosExtras = null) { 
        this.dados = dados; 
        this.maxNumero = maxNumero; 
        this.loteriaNome = loteriaNome; 
        this.treinado = false; 
        this.confianca = 0; 
        this.dadosExtras = dadosExtras; // Para Timemania (times do coração)
        
        // Obter configuração da loteria
        const loteriaId = this.getLoteriaId(loteriaNome);
        const config = window.LOTERIAS ? window.LOTERIAS[loteriaId] : null;
        this.incluirZero = config ? config.incluirZero : false;
        this.minNumero = this.incluirZero ? 0 : 1;
        
        // Identificar tipo de loteria (NÃO ALTERA OUTRAS LOTERIAS)
        this.isLoteca = loteriaId === 'loteca';
        this.isTimemania = loteriaId === 'timemania';
        this.permiteRepeticao = this.isLoteca;
        
        // Para Timemania: extrair times do coração dos dados históricos
        if (this.isTimemania && dadosExtras && dadosExtras.length > 0) {
            this.timesHistoricos = dadosExtras.filter(t => t !== null);
        } else {
            this.timesHistoricos = [];
        }
    }
    
    // Função auxiliar para converter nome da loteria para ID
    getLoteriaId(nome) {
        const mapa = {
            'Mega-Sena': 'megasena',
            'Quina': 'quina',
            'Lotofácil': 'lotofacil',
            'Lotomania': 'lotomania',
            'Dupla Sena': 'duplasena',
            'Timemania': 'timemania',
            '+Milionária': 'milionaria',
            'Loteca': 'loteca',
            'Dia de Sorte': 'diadesorte',
            'Super Sete': 'supersete'
        };
        return mapa[nome] || 'megasena';
    }
    
    calcularFrequenciaPonderada() {
        const total = this.dados.length;
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        const freq = new Array(limite).fill(0);
        
        for (let i = 0; i < this.dados.length; i++) { 
            const peso = Math.pow(1.2, i / total); 
            for (const n of this.dados[i]) {
                if (n >= 0 && n < limite) freq[n] += peso; 
            }
        }
        
        const maxFreq = Math.max(...freq.slice(this.minNumero));
        const res = [];
        for (let n = this.minNumero; n < limite; n++) {
            res.push({ 
                numero: n, 
                frequencia: maxFreq > 0 ? freq[n] / maxFreq : 0, 
                probabilidade: total > 0 ? (freq[n] / total) * 100 : 0 
            });
        }
        return res;
    }
    
    calcularAtraso() {
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        const atraso = new Array(limite).fill(this.dados.length);
        
        for (let n = this.minNumero; n < limite; n++) 
            for (let i = this.dados.length-1; i >= 0; i--) 
                if (this.dados[i].includes(n)) { 
                    atraso[n] = this.dados.length - 1 - i; 
                    break; 
                }
        
        const maxAtraso = Math.max(...atraso.slice(this.minNumero));
        const res = [];
        for (let n = this.minNumero; n < limite; n++) {
            res.push({ 
                numero: n, 
                atraso: atraso[n], 
                fator: maxAtraso > 0 ? atraso[n] / maxAtraso : 0 
            });
        }
        return res;
    }
    
    calcularScoreCompleto() {
        const freq = this.calcularFrequenciaPonderada();
        const atraso = this.calcularAtraso();
        const scores = [];
        
        for (let n = this.minNumero; n <= this.maxNumero; n++) { 
            const idx = n - this.minNumero;
            let score = (1 - (freq[idx]?.frequencia || 0)) * 50 + (atraso[idx]?.fator || 0) * 50; 
            scores.push({ numero: n, score: score, atraso: atraso[idx]?.atraso || 0 }); 
        }
        return scores.sort((a,b) => b.score - a.score);
    }
    
    treinar() { 
        if (this.dados.length < 10) return false; 
        this.treinado = true; 
        this.confianca = Math.min(95, Math.floor(this.dados.length / 10) + 50); 
        return true; 
    }
    
    // ============================================
    // MÉTODO ESPECIAL PARA LOTECA (NÃO AFETA OUTRAS LOTERIAS)
    // ============================================
    predizerLoteca(qtd) {
        const jogo = [];
        
        // Analisar frequência de cada resultado nos dados históricos
        const freqResultados = [0, 0, 0]; // [empate, coluna1, coluna2]
        let total = 0;
        
        for (const concurso of this.dados) {
            for (const resultado of concurso) {
                if (resultado >= 0 && resultado <= 2) {
                    freqResultados[resultado]++;
                    total++;
                }
            }
        }
        
        // Calcular probabilidades baseadas nos dados históricos
        const probs = freqResultados.map(f => total > 0 ? f / total : 1/3);
        
        for (let pos = 0; pos < qtd; pos++) {
            // Adicionar um pequeno fator de aleatoriedade baseado na posição
            const rand = Math.random();
            let escolha = 0;
            let acumulado = 0;
            
            // Escolher baseado nas probabilidades históricas + ruído
            for (let i = 0; i < probs.length; i++) {
                acumulado += probs[i];
                if (rand < acumulado) {
                    escolha = i;
                    break;
                }
            }
            
            jogo.push(escolha);
        }
        
        return jogo;
    }
    
    // ============================================
    // MÉTODO ESPECIAL PARA TIMEMANIA (NÃO AFETA OUTRAS LOTERIAS)
    // ============================================
    predizerTimeTimemania() {
        // Se temos dados históricos de times, usar frequência
        if (this.timesHistoricos && this.timesHistoricos.length > 0) {
            // Contar frequência de cada time
            const freqTimes = {};
            for (const time of this.timesHistoricos) {
                // Garantir que time é um número
                const timeNum = typeof time === 'string' ? parseInt(time) : time;
                if (!isNaN(timeNum)) {
                    freqTimes[timeNum] = (freqTimes[timeNum] || 0) + 1;
                }
            }
            
            // Ordenar times por frequência
            const timesOrdenados = Object.entries(freqTimes)
                .sort((a, b) => b[1] - a[1])
                .map(entry => parseInt(entry[0]));
            
            // Pegar os 5 times mais frequentes
            const topTimes = timesOrdenados.slice(0, 5);
            
            // Escolher aleatoriamente entre os top times (com peso)
            if (topTimes.length > 0) {
                // Dar mais peso aos primeiros (mais frequentes)
                const pesoTop = topTimes.map((_, idx) => Math.max(1, 5 - idx));
                const totalPeso = pesoTop.reduce((a, b) => a + b, 0);
                let rand = Math.random() * totalPeso;
                
                for (let i = 0; i < topTimes.length; i++) {
                    rand -= pesoTop[i];
                    if (rand <= 0) {
                        return topTimes[i];
                    }
                }
                return topTimes[0];
            }
        }
        
        // Fallback: gerar time aleatório de 1 a 80
        return Math.floor(Math.random() * 80) + 1;
    }
    
    // ============================================
    // MÉTODO PRINCIPAL - COM SUPORTE A LOTECA E TIMEMANIA
    // ============================================
    predizerIAEspecialista(qtd, usarDispersao = true, windowDispersao = 10, seed = 0) {
        // SE FOR LOTECA, usa método especial (NÃO AFETA OUTRAS LOTERIAS)
        if (this.isLoteca) {
            return this.predizerLoteca(qtd);
        }
        
        // Para as demais loterias, mantém o código ORIGINAL
        if (!this.treinado) return this.predizerAleatorio(qtd, seed);
        
        const scores = this.calcularScoreCompleto();
        const ruido = (seed % 100) / 100;
        let scoresRuido = scores.map(s => ({ ...s, score: s.score * (0.7 + ruido + Math.random() * 0.6) }));
        
        if (usarDispersao && this.dados.length >= windowDispersao) {
            const recentes = new Set();
            this.dados.slice(-windowDispersao).forEach(jogo => jogo.forEach(n => recentes.add(n)));
            scoresRuido = scoresRuido.map(s => ({ ...s, score: recentes.has(s.numero) ? s.score * 0.1 : s.score }));
        }
        
        scoresRuido.sort((a,b) => b.score - a.score);
        
        const candidatos = scoresRuido.filter(s => s.numero >= this.minNumero).slice(0, Math.max(qtd * 2, 20));
        
        const resultado = new Set();
        while (resultado.size < qtd && candidatos.length > 0) { 
            const idx = Math.floor(Math.random() * candidatos.length); 
            resultado.add(candidatos[idx].numero); 
            candidatos.splice(idx, 1); 
        }
        
        if (resultado.size < qtd) { 
            const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
            const todos = Array.from({ length: limite - this.minNumero }, (_, i) => i + this.minNumero); 
            const disp = todos.filter(n => !resultado.has(n)); 
            while (resultado.size < qtd && disp.length > 0) { 
                const idx = Math.floor(Math.random() * disp.length); 
                resultado.add(disp[idx]); 
                disp.splice(idx, 1); 
            } 
        }
        return Array.from(resultado).sort((a,b) => a - b);
    }
    
    predizerAleatorio(qtd, seed = 0) { 
        const res = new Set(); 
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        while (res.size < qtd) {
            let num = Math.floor(Math.random() * (limite - this.minNumero) + this.minNumero);
            res.add(num); 
        }
        return Array.from(res).sort((a,b)=>a-b); 
    }
    
    calcularConfiancaJogo(jogo) {
        if (!this.treinado) return 50;
        const freq = this.calcularFrequenciaPonderada();
        const atraso = this.calcularAtraso();
        let conf = 0;
        for (const n of jogo) {
            const idx = n - this.minNumero;
            if (idx >= 0 && idx < freq.length) {
                conf += (1 - freq[idx].frequencia) * 40 + atraso[idx].fator * 60;
            }
        }
        return Math.min(100, Math.max(0, Math.floor(conf / jogo.length)));
    }
    
    gerarRelatorio() { 
        const melhores = this.calcularScoreCompleto().slice(0,10);
        return { 
            loteria: this.loteriaNome, 
            confiancaGeral: this.confianca, 
            totalDados: this.dados.length, 
            melhoresNumerosAtuais: melhores.map(s => ({ 
                numero: s.numero, 
                pontuacao: s.score.toFixed(0) 
            })) 
        }; 
    }
    
    predizerMesSorte() { return Math.floor(Math.random() * 12) + 1; }
    
    // ============================================
    // MÉTODO PREDIZER TIME - CORRIGIDO
    // ============================================
    predizerTimeSorte() { 
        return this.predizerTimeTimemania(); 
    }
    
    predizerTrevos(qtd) { 
        const t = new Set(); 
        while (t.size < qtd) t.add(Math.floor(Math.random() * 6) + 1); 
        return Array.from(t).sort((a,b)=>a-b); 
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW (COMPATIBILIDADE)
// ============================================
window.AdvancedLotteryAI = AdvancedLotteryAI;

console.log('✅ IA.js corrigido (Loteca + Timemania)');
