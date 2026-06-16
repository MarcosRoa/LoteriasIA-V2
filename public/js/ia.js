// ============================================
// IA.js - Class AdvancedLotteryAI (FASE 20 - CORREÇÃO LOTECA + TIMEMANIA)
// ============================================

// ============================================
// IA.js - Class AdvancedLotteryAI (VERSÃO COMPLETA E CORRIGIDA) 16/06/2026
// ============================================

class AdvancedLotteryAI {
    constructor(dados, maxNumero, loteriaNome, dadosExtras = null) { 
        this.dados = dados || []; 
        this.maxNumero = maxNumero || 60; 
        this.loteriaNome = loteriaNome || 'Mega-Sena'; 
        this.treinado = false; 
        this.confianca = 0; 
        this.dadosExtras = dadosExtras || [];
        
        // 🔧 CORREÇÃO 3: getLoteriaId com mapeamento completo
        const loteriaId = this.getLoteriaId(loteriaNome);
        
        // 🔧 CORREÇÃO 4: Fallback para window.LOTERIAS
        const config = window.LOTERIAS 
            ? window.LOTERIAS[loteriaId] 
            : null;
        
        this.incluirZero = config ? config.incluirZero : false;
        this.minNumero = this.incluirZero ? 0 : 1;
        
        this.isLoteca = loteriaId === 'loteca';
        this.isTimemania = loteriaId === 'timemania';
        this.permiteRepeticao = this.isLoteca;
        
        // 🔧 CORREÇÃO 1: Tratamento robusto para dadosExtras
        if (this.isTimemania && this.dadosExtras && this.dadosExtras.length > 0) {
            // Garantir que temos um array plano
            let flattened = this.dadosExtras;
            
            // Se o primeiro elemento é um array, usar flat()
            if (Array.isArray(this.dadosExtras[0])) {
                flattened = this.dadosExtras.flat();
            }
            
            // Extrair strings de objetos se necessário
            const timesExtraidos = flattened
                .filter(t => t !== null && t !== undefined)
                .map(t => {
                    // Se for string, usar diretamente
                    if (typeof t === 'string') return t;
                    // Se for objeto com time_coracao, extrair
                    if (typeof t === 'object' && t !== null && t.time_coracao) {
                        return t.time_coracao;
                    }
                    // Se for objeto com dados_extras (pode acontecer)
                    if (typeof t === 'object' && t !== null && t.dados_extras) {
                        return t.dados_extras;
                    }
                    return null;
                })
                .filter(t => t !== null && typeof t === 'string')
                .map(t => t.trim())
                .filter(t => t.length > 0);
            
            this.timesHistoricos = timesExtraidos;
            
            // Log para debug (opcional)
            if (this.timesHistoricos.length > 0) {
                console.log(`✅ Timemania: ${this.timesHistoricos.length} times históricos carregados`);
            } else {
                console.warn('⚠️ Timemania: Nenhum time histórico encontrado! Usando fallback.');
            }
        } else {
            this.timesHistoricos = [];
        }
    }
    
    // ============================================
    // getLoteriaId - MAPEAMENTO COMPLETO CORRIGIDO
    // ============================================
    getLoteriaId(nome) {
        if (!nome) return 'megasena';
        
        const lowerNome = nome.toLowerCase().trim();
        
        const mapa = {
            // Mega-Sena
            'mega-sena': 'megasena',
            'megasena': 'megasena',
            
            // Quina
            'quina': 'quina',
            
            // Lotofácil
            'lotofácil': 'lotofacil',
            'lotofacil': 'lotofacil',
            
            // Lotomania
            'lotomania': 'lotomania',
            
            // Dupla Sena
            'dupla sena': 'duplasena',
            'duplasena': 'duplasena',
            
            // Timemania
            'timemania': 'timemania',
            
            // +Milionária
            '+milionária': 'milionaria',
            'milionaria': 'milionaria',
            '+milionaria': 'milionaria',
            
            // Loteca
            'loteca': 'loteca',
            
            // Dia de Sorte
            'dia de sorte': 'diadesorte',
            'diadesorte': 'diadesorte',
            
            // Super Sete
            'super sete': 'supersete',
            'supersete': 'supersete'
        };
        
        return mapa[lowerNome] || 'megasena';
    }
    
    // ============================================
    // MÉTODOS DE ANÁLISE
    // ============================================
    calcularFrequenciaPonderada() {
        const total = this.dados.length;
        if (total === 0) return [];
        
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
        
        for (let n = this.minNumero; n < limite; n++) {
            for (let i = this.dados.length-1; i >= 0; i--) {
                if (this.dados[i].includes(n)) { 
                    atraso[n] = this.dados.length - 1 - i; 
                    break; 
                }
            }
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
    // MÉTODO ESPECIAL PARA LOTECA
    // ============================================
    predizerLoteca(qtd) {
        const numJogos = qtd || 14;
        const jogo = [];
        
        if (this.dados.length === 0) {
            for (let pos = 0; pos < numJogos; pos++) {
                jogo.push(Math.floor(Math.random() * 3));
            }
            return jogo;
        }
        
        const freqResultados = [0, 0, 0];
        let total = 0;
        
        for (const concurso of this.dados) {
            if (Array.isArray(concurso)) {
                for (const resultado of concurso) {
                    if (resultado >= 0 && resultado <= 2) {
                        freqResultados[resultado]++;
                        total++;
                    }
                }
            }
        }
        
        if (total === 0) {
            for (let pos = 0; pos < numJogos; pos++) {
                jogo.push(Math.floor(Math.random() * 3));
            }
            return jogo;
        }
        
        const probs = freqResultados.map(f => f / total);
        
        for (let pos = 0; pos < numJogos; pos++) {
            const variacao = (pos / numJogos) * 0.1;
            const rand = Math.random();
            let escolha = 0;
            let acumulado = 0;
            
            for (let i = 0; i < probs.length; i++) {
                acumulado += probs[i] * (1 + variacao * (i === 1 ? 1 : -1));
                if (rand < acumulado) {
                    escolha = i;
                    break;
                }
            }
            
            if (escolha > 2) escolha = 2;
            if (escolha < 0) escolha = 0;
            jogo.push(escolha);
        }
        
        return jogo;
    }
    
    // ============================================
    // MÉTODO ESPECIAL PARA TIMEMANIA - TIME DO CORAÇÃO
    // ============================================
    predizerTimeTimemania() {
        if (this.timesHistoricos && this.timesHistoricos.length > 0) {
            const freqTimes = {};
            
            for (const time of this.timesHistoricos) {
                if (!time) continue;
                freqTimes[time] = (freqTimes[time] || 0) + 1;
            }
            
            const timesOrdenados = Object.entries(freqTimes)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);
            
            if (timesOrdenados.length > 0) {
                const topTimes = timesOrdenados.slice(0, Math.min(5, timesOrdenados.length));
                // Escolher aleatoriamente entre os top times
                return topTimes[Math.floor(Math.random() * topTimes.length)];
            }
        }
        
        // Fallback: times mais comuns
        const timesFallback = [
            'FLAMENGO/RJ', 'PALMEIRAS/SP', 'CORINTHIANS/SP',
            'SÃO PAULO/SP', 'CRUZEIRO/MG', 'VASCO/RJ',
            'FLUMINENSE/RJ', 'INTERNACIONAL/RS', 'GRÊMIO/RS',
            'ATLÉTICO/MG'
        ];
        return timesFallback[Math.floor(Math.random() * timesFallback.length)];
    }
    
    predizerTimeSorte() {
        return this.predizerTimeTimemania();
    }
    
    // ============================================
    // MÉTODO ALEATÓRIO CORRIGIDO
    // ============================================
    predizerAleatorio(qtd, seed = 0) {
        // LOTECA: permite repetição
        if (this.isLoteca) {
            const jogo = [];
            for (let i = 0; i < qtd; i++) {
                jogo.push(Math.floor(Math.random() * 3));
            }
            return jogo;
        }
        
        // DEMAIS LOTERIAS: números únicos
        const res = new Set();
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        
        let tentativas = 0;
        const maxTentativas = 1000;
        
        while (res.size < qtd && tentativas < maxTentativas) {
            tentativas++;
            const num = Math.floor(Math.random() * (limite - this.minNumero)) + this.minNumero;
            res.add(num);
        }
        
        // Fallback: se não conseguiu todos, preencher
        if (res.size < qtd) {
            for (let i = 0; i < 100 && res.size < qtd; i++) {
                const num = Math.floor(Math.random() * (limite - this.minNumero)) + this.minNumero;
                res.add(num);
            }
        }
        
        return Array.from(res).sort((a,b) => a - b);
    }
    
    // ============================================
    // MÉTODO ALEATÓRIO INTELIGENTE
    // ============================================
    predizerAleatorioInteligente(qtd, usarDispersao = true, windowDispersao = 10) {
        if (this.isLoteca) {
            return this.predizerLoteca(qtd);
        }
        
        const scores = this.calcularScoreCompleto();
        const disponiveis = scores.filter(s => s.numero >= this.minNumero).map(s => s.numero);
        
        if (usarDispersao && this.dados.length >= windowDispersao) {
            const recentes = new Set();
            this.dados.slice(-windowDispersao).forEach(jogo => jogo.forEach(n => recentes.add(n)));
            const disponiveisFiltrados = disponiveis.filter(n => !recentes.has(n));
            if (disponiveisFiltrados.length >= qtd) {
                const shuffled = disponiveisFiltrados.sort(() => Math.random() - 0.5);
                return shuffled.slice(0, qtd).sort((a, b) => a - b);
            }
        }
        
        const shuffled = disponiveis.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, qtd).sort((a, b) => a - b);
    }
    
    // ============================================
    // MÉTODO PROBABILÍSTICO
    // ============================================
    predizerProbabilistico(qtd, usarDispersao = true, windowDispersao = 10) {
        if (this.isLoteca) {
            return this.predizerLoteca(qtd);
        }
        
        const scores = this.calcularScoreCompleto();
        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        
        let candidatos = scores.map(s => ({
            ...s,
            probabilidade: totalScore > 0 ? s.score / totalScore : 1 / scores.length
        }));
        
        if (usarDispersao && this.dados.length >= windowDispersao) {
            const recentes = new Set();
            this.dados.slice(-windowDispersao).forEach(jogo => jogo.forEach(n => recentes.add(n)));
            candidatos = candidatos.map(s => ({
                ...s,
                probabilidade: recentes.has(s.numero) ? s.probabilidade * 0.1 : s.probabilidade
            }));
            
            const novoTotal = candidatos.reduce((sum, s) => sum + s.probabilidade, 0);
            if (novoTotal > 0) {
                candidatos = candidatos.map(s => ({ ...s, probabilidade: s.probabilidade / novoTotal }));
            }
        }
        
        const resultado = new Set();
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        let tentativas = 0;
        const maxTentativas = 1000;
        
        while (resultado.size < qtd && tentativas < maxTentativas) {
            tentativas++;
            const rand = Math.random();
            let acumulado = 0;
            for (const c of candidatos) {
                acumulado += c.probabilidade;
                if (rand < acumulado && c.numero >= this.minNumero && !resultado.has(c.numero)) {
                    resultado.add(c.numero);
                    break;
                }
            }
        }
        
        if (resultado.size < qtd) {
            const todos = Array.from({ length: limite - this.minNumero }, (_, i) => i + this.minNumero);
            const disp = todos.filter(n => !resultado.has(n));
            let fallbackTentativas = 0;
            while (resultado.size < qtd && disp.length > 0 && fallbackTentativas < 1000) {
                fallbackTentativas++;
                const idx = Math.floor(Math.random() * disp.length);
                resultado.add(disp[idx]);
                disp.splice(idx, 1);
            }
            
            if (resultado.size < qtd) {
                for (let n = this.minNumero; n <= this.maxNumero && resultado.size < qtd; n++) {
                    resultado.add(n);
                }
            }
        }
        
        return Array.from(resultado).sort((a, b) => a - b);
    }
    
    // ============================================
    // MÉTODO PRINCIPAL IA ESPECIALISTA (COM PROTEÇÃO CONTRA LOOP)
    // ============================================
    predizerIAEspecialista(qtd, usarDispersao = true, windowDispersao = 10, seed = 0) {
        // LOTECA
        if (this.isLoteca) {
            return this.predizerLoteca(qtd);
        }
        
        // DEMAIS LOTERIAS
        if (!this.treinado) return this.predizerAleatorio(qtd, seed);
        
        const scores = this.calcularScoreCompleto();
        const ruido = (seed % 100) / 100;
        let scoresRuido = scores.map(s => ({ ...s, score: s.score * (0.7 + ruido + Math.random() * 0.6) }));
        
        // 🔧 CORREÇÃO 3: Usar !this.isLoteca em vez de config.maxNumero > 2
        if (usarDispersao && this.dados.length >= windowDispersao && !this.isLoteca) {
            const recentes = new Set();
            this.dados.slice(-windowDispersao).forEach(jogo => jogo.forEach(n => recentes.add(n)));
            scoresRuido = scoresRuido.map(s => ({ ...s, score: recentes.has(s.numero) ? s.score * 0.1 : s.score }));
        }
        
        scoresRuido.sort((a,b) => b.score - a.score);
        
        const candidatos = scoresRuido.filter(s => s.numero >= this.minNumero).slice(0, Math.max(qtd * 2, 20));
        
        const resultado = new Set();
        let tentativas = 0;
        const maxTentativas = 1000;
        
        // Primeira fase: escolher dos candidatos
        while (resultado.size < qtd && tentativas < maxTentativas && candidatos.length > 0) {
            tentativas++;
            const idx = Math.floor(Math.random() * candidatos.length);
            resultado.add(candidatos[idx].numero);
            candidatos.splice(idx, 1);
        }
        
        // 🔧 CORREÇÃO 2: Segunda fase com proteção contra loop
        if (resultado.size < qtd) {
            const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
            const todos = Array.from({ length: limite - this.minNumero }, (_, i) => i + this.minNumero);
            const disp = todos.filter(n => !resultado.has(n));
            
            let fallbackTentativas = 0;
            while (resultado.size < qtd && disp.length > 0 && fallbackTentativas < maxTentativas) {
                fallbackTentativas++;
                const idx = Math.floor(Math.random() * disp.length);
                resultado.add(disp[idx]);
                disp.splice(idx, 1);
            }
            
            // Último recurso: forçar números únicos sequenciais
            if (resultado.size < qtd) {
                for (let n = this.minNumero; n <= this.maxNumero && resultado.size < qtd; n++) {
                    resultado.add(n);
                }
            }
        }
        
        return Array.from(resultado).sort((a,b) => a - b);
    }
    
    // ============================================
    // MÉTODOS AUXILIARES
    // ============================================
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
    
    predizerMesSorte() { 
        return Math.floor(Math.random() * 12) + 1; 
    }
    
    predizerTrevos(qtd) { 
        const t = new Set(); 
        while (t.size < qtd) t.add(Math.floor(Math.random() * 6) + 1); 
        return Array.from(t).sort((a,b)=>a-b); 
    }
}

// ============================================
// EXPORTAÇÃO PARA O WINDOW
// ============================================
window.AdvancedLotteryAI = AdvancedLotteryAI;

console.log('✅ IA.js carregado (VERSÃO COMPLETA CORRIGIDA)');
