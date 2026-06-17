// api/generate/index.ts
// api/generate/index.ts 16/06/2026
// api/generate/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================
const LOTTERY_CONFIGS: Record<string, { 
    maxNumero: number; 
    numerosPadrao: number; 
    permiteRepeticao?: boolean;
    incluiZero?: boolean;
    temTime?: boolean;
    temMes?: boolean;
}> = {
    megasena: { maxNumero: 60, numerosPadrao: 6 },
    quina: { maxNumero: 80, numerosPadrao: 5 },
    lotofacil: { maxNumero: 25, numerosPadrao: 15 },
    lotomania: { maxNumero: 99, numerosPadrao: 50 },
    duplasena: { maxNumero: 50, numerosPadrao: 6 },
    timemania: { maxNumero: 80, numerosPadrao: 10, temTime: true },
    milionaria: { maxNumero: 50, numerosPadrao: 6 },
    loteca: { maxNumero: 2, numerosPadrao: 14, permiteRepeticao: true, incluiZero: true },
    diadesorte: { maxNumero: 31, numerosPadrao: 7, temMes: true },
    supersete: { maxNumero: 9, numerosPadrao: 7 }
};

// ============================================
// CLASSE ADVANCED LOTTERY AI (VERSÃO NODE.JS)
// ============================================
class AdvancedLotteryAI {
    dados: number[][];
    maxNumero: number;
    loteriaNome: string;
    dadosExtras: any[];
    treinado: boolean;
    confianca: number;
    incluirZero: boolean;
    minNumero: number;
    isLoteca: boolean;
    isTimemania: boolean;
    isDiaDeSorte: boolean;
    timesHistoricos: string[];
    mesesHistoricos: number[];

    constructor(dados: number[][], maxNumero: number, loteriaNome: string, dadosExtras: any[] = []) {
        this.dados = dados || [];
        this.maxNumero = maxNumero;
        this.loteriaNome = loteriaNome;
        this.dadosExtras = dadosExtras || [];
        this.treinado = false;
        this.confianca = 0;
        
        const loteriaId = this.getLoteriaId(loteriaNome);
        const config = LOTTERY_CONFIGS[loteriaId];
        this.incluirZero = config?.incluiZero || false;
        this.minNumero = this.incluirZero ? 0 : 1;
        
        this.isLoteca = loteriaId === 'loteca';
        this.isTimemania = loteriaId === 'timemania';
        this.isDiaDeSorte = loteriaId === 'diadesorte';
        
        // ============================================
        // 🔧 CORREÇÃO 1: TIMEMANIA - Extrair times de objetos ou strings
        // ============================================
        if (this.isTimemania && this.dadosExtras && this.dadosExtras.length > 0) {
            const flattened = Array.isArray(this.dadosExtras[0]) 
                ? this.dadosExtras.flat() 
                : this.dadosExtras;
            
            this.timesHistoricos = flattened
                .filter(t => t !== null && t !== undefined)
                .map(t => {
                    // Se for string, usa diretamente
                    if (typeof t === 'string') return t;
                    // Se for objeto com time_coracao, extrai
                    if (typeof t === 'object' && t !== null && t.time_coracao) return t.time_coracao;
                    // Se for objeto com dados_extras, extrai
                    if (typeof t === 'object' && t !== null && t.dados_extras) return t.dados_extras;
                    return null;
                })
                .filter(t => t !== null && typeof t === 'string')
                .map(t => t.trim())
                .filter(t => t.length > 0);
        } else {
            this.timesHistoricos = [];
        }
        
        // ============================================
        // 🔧 CORREÇÃO 2: DIA DE SORTE - Extrair meses do array extras
        // ============================================
        if (this.isDiaDeSorte && this.dadosExtras && this.dadosExtras.length > 0) {
            const flattened = Array.isArray(this.dadosExtras[0]) 
                ? this.dadosExtras.flat() 
                : this.dadosExtras;
            
            this.mesesHistoricos = flattened
                .filter(m => m !== null && m !== undefined)
                .map(m => {
                    // Se for número, usa diretamente
                    if (typeof m === 'number') return m;
                    // Se for objeto com mesSorte, extrai
                    if (typeof m === 'object' && m !== null && m.mesSorte) return m.mesSorte;
                    return null;
                })
                .filter(m => m !== null && typeof m === 'number' && m >= 1 && m <= 12)
                .map(m => Number(m));
        } else {
            this.mesesHistoricos = [];
        }
    }

    getLoteriaId(nome: string): string {
        const lowerNome = nome.toLowerCase().trim();
        
        const mapa: Record<string, string> = {
            'mega-sena': 'megasena',
            'megasena': 'megasena',
            'quina': 'quina',
            'lotofácil': 'lotofacil',
            'lotofacil': 'lotofacil',
            'lotomania': 'lotomania',
            'dupla sena': 'duplasena',
            'duplasena': 'duplasena',
            'timemania': 'timemania',
            '+milionária': 'milionaria',
            'milionaria': 'milionaria',
            '+milionaria': 'milionaria',
            'loteca': 'loteca',
            'dia de sorte': 'diadesorte',
            'diadesorte': 'diadesorte',
            'super sete': 'supersete',
            'supersete': 'supersete'
        };
        
        return mapa[lowerNome] || 'megasena';
    }

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
            for (let i = this.dados.length - 1; i >= 0; i--) {
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
        return scores.sort((a, b) => b.score - a.score);
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
    predizerLoteca(qtd: number): number[] {
        const numJogos = qtd || 14;
        const jogo: number[] = [];
        
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
    // MÉTODO ESPECIAL PARA TIMEMANIA
    // ============================================
    predizerTimeTimemania(): string {
        if (this.timesHistoricos && this.timesHistoricos.length > 0) {
            const freqTimes: Record<string, number> = {};
            
            for (const time of this.timesHistoricos) {
                if (!time) continue;
                freqTimes[time] = (freqTimes[time] || 0) + 1;
            }
            
            const timesOrdenados = Object.entries(freqTimes)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);
            
            if (timesOrdenados.length > 0) {
                const topTimes = timesOrdenados.slice(0, Math.min(5, timesOrdenados.length));
                return topTimes[Math.floor(Math.random() * topTimes.length)];
            }
        }
        
        const timesFallback = [
            'FLAMENGO/RJ', 'PALMEIRAS/SP', 'CORINTHIANS/SP',
            'SÃO PAULO/SP', 'CRUZEIRO/MG', 'VASCO/RJ',
            'FLUMINENSE/RJ', 'INTERNACIONAL/RS', 'GRÊMIO/RS',
            'ATLÉTICO/MG'
        ];
        return timesFallback[Math.floor(Math.random() * timesFallback.length)];
    }

    // ============================================
    // MÉTODO ESPECIAL PARA DIA DE SORTE
    // ============================================
    predizerMesSorte(): number {
        if (this.mesesHistoricos && this.mesesHistoricos.length > 0) {
            const freqMeses: Record<number, number> = {};
            for (const mes of this.mesesHistoricos) {
                if (mes >= 1 && mes <= 12) {
                    freqMeses[mes] = (freqMeses[mes] || 0) + 1;
                }
            }
            
            const mesesOrdenados = Object.entries(freqMeses)
                .sort((a, b) => b[1] - a[1])
                .map(entry => parseInt(entry[0]));
            
            if (mesesOrdenados.length > 0) {
                const topMeses = mesesOrdenados.slice(0, Math.min(3, mesesOrdenados.length));
                const pesos = topMeses.map((_, idx) => Math.max(1, 3 - idx));
                const totalPeso = pesos.reduce((a, b) => a + b, 0);
                let rand = Math.random() * totalPeso;
                
                for (let i = 0; i < topMeses.length; i++) {
                    rand -= pesos[i];
                    if (rand <= 0) {
                        return topMeses[i];
                    }
                }
                return topMeses[0];
            }
        }
        
        return Math.floor(Math.random() * 12) + 1;
    }

    // ============================================
    // MÉTODO ALEATÓRIO CORRIGIDO
    // ============================================
    predizerAleatorio(qtd: number, seed: number = 0): number[] {
        if (this.isLoteca) {
            const jogo: number[] = [];
            for (let i = 0; i < qtd; i++) {
                jogo.push(Math.floor(Math.random() * 3));
            }
            return jogo;
        }
        
        const res = new Set<number>();
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        
        let tentativas = 0;
        const maxTentativas = 1000;
        
        while (res.size < qtd && tentativas < maxTentativas) {
            tentativas++;
            const num = Math.floor(Math.random() * (limite - this.minNumero)) + this.minNumero;
            res.add(num);
        }
        
        if (res.size < qtd) {
            for (let i = 0; i < 100 && res.size < qtd; i++) {
                const num = Math.floor(Math.random() * (limite - this.minNumero)) + this.minNumero;
                res.add(num);
            }
        }
        
        return Array.from(res).sort((a, b) => a - b);
    }

    // ============================================
    // MÉTODO ALEATÓRIO INTELIGENTE
    // ============================================
    predizerAleatorioInteligente(qtd: number, usarDispersao: boolean = true, windowDispersao: number = 10): number[] {
        if (this.isLoteca) {
            return this.predizerLoteca(qtd);
        }
        
        const scores = this.calcularScoreCompleto();
        const disponiveis = scores.filter(s => s.numero >= this.minNumero).map(s => s.numero);
        
        if (usarDispersao && this.dados.length >= windowDispersao) {
            const recentes = new Set<number>();
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
    predizerProbabilistico(qtd: number, usarDispersao: boolean = true, windowDispersao: number = 10): number[] {
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
            const recentes = new Set<number>();
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
        
        const resultado = new Set<number>();
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
    // MÉTODO PRINCIPAL IA ESPECIALISTA
    // ============================================
    predizerIAEspecialista(qtd: number, usarDispersao: boolean = true, windowDispersao: number = 10, seed: number = 0): number[] {
        if (this.isLoteca) {
            return this.predizerLoteca(qtd);
        }
        
        if (!this.treinado) return this.predizerAleatorio(qtd, seed);
        
        const scores = this.calcularScoreCompleto();
        const ruido = (seed % 100) / 100;
        let scoresRuido = scores.map(s => ({ ...s, score: s.score * (0.7 + ruido + Math.random() * 0.6) }));
        
        if (usarDispersao && this.dados.length >= windowDispersao && !this.isLoteca) {
            const recentes = new Set<number>();
            this.dados.slice(-windowDispersao).forEach(jogo => jogo.forEach(n => recentes.add(n)));
            scoresRuido = scoresRuido.map(s => ({ ...s, score: recentes.has(s.numero) ? s.score * 0.1 : s.score }));
        }
        
        scoresRuido.sort((a, b) => b.score - a.score);
        
        const candidatos = scoresRuido.filter(s => s.numero >= this.minNumero).slice(0, Math.max(qtd * 2, 20));
        
        const resultado = new Set<number>();
        let tentativas = 0;
        const maxTentativas = 1000;
        
        while (resultado.size < qtd && tentativas < maxTentativas && candidatos.length > 0) {
            tentativas++;
            const idx = Math.floor(Math.random() * candidatos.length);
            resultado.add(candidatos[idx].numero);
            candidatos.splice(idx, 1);
        }
        
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
            
            if (resultado.size < qtd) {
                for (let n = this.minNumero; n <= this.maxNumero && resultado.size < qtd; n++) {
                    resultado.add(n);
                }
            }
        }
        
        return Array.from(resultado).sort((a, b) => a - b);
    }

    predizerTimeSorte(): string {
        return this.predizerTimeTimemania();
    }
}

// ============================================
// FUNÇÃO PRINCIPAL DA API
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { uid, lottery, quantity, mode, extraNumbers, filters, dados, dadosExtras } = req.body;
    
    if (!uid || !lottery || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const config = LOTTERY_CONFIGS[lottery];
    if (!config) {
        return res.status(400).json({ error: 'Invalid lottery' });
    }
    
    try {
        // Buscar usuário
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('creditos, is_pro, email')
            .eq('uid', uid)
            .single();
        
        if (userError) throw userError;
        
        const numerosPorJogo = extraNumbers || config.numerosPadrao;
        const isProFixed = user.email === 'mresquadriasaluminio@gmail.com';
        const custoPorJogo = isProFixed ? 0 : (user.is_pro ? 2 : 3);
        const custoTotal = quantity * custoPorJogo;
        
        if (custoTotal > 0 && user.creditos < custoTotal) {
            return res.status(402).json({ error: 'Saldo insuficiente' });
        }
        
        // ============================================
        // CARREGAR DADOS HISTÓRICOS
        // ============================================
        let dadosFiltrados: number[][] = [];
        let dadosExtrasFiltrados: any[] = [];
        
        if (dados && Array.isArray(dados) && dados.length > 0) {
            dadosFiltrados = dados;
            dadosExtrasFiltrados = dadosExtras || [];
            console.log(`📊 Usando dados do frontend: ${dadosFiltrados.length} concursos`);
        } else {
            console.log(`📊 Buscando dados do Supabase para ${lottery}...`);
            
            const { data: historico, error: histError } = await supabase
                .from('historico_palpites')
                .select('jogos, extras, times, data')
                .eq('loteria', lottery)
                .order('data', { ascending: false })
                .limit(1000);
            
            if (histError) {
                console.warn('⚠️ Erro ao buscar histórico:', histError.message);
                dadosFiltrados = [];
                dadosExtrasFiltrados = [];
            } else if (historico && historico.length > 0) {
                dadosFiltrados = historico
                    .map(item => item.jogos)
                    .flat()
                    .filter(j => Array.isArray(j) && j.length > 0) as number[][];
                
                // 🔧 CORREÇÃO 3: TIMEMANIA - Extrair times do array de extras
                if (lottery === 'timemania') {
                    dadosExtrasFiltrados = historico
                        .map(item => item.times || item.extras?.timeCoracao)
                        .flat()
                        .filter(t => t !== null && t !== undefined);
                }
                
                // 🔧 CORREÇÃO 4: DIA DE SORTE - Extrair meses do array extras
                if (lottery === 'diadesorte') {
                    dadosExtrasFiltrados = historico
                        .map(item => item.extras)
                        .flat()
                        .map((e: any) => e?.mesSorte)
                        .filter(m => m !== null && m !== undefined && typeof m === 'number' && m >= 1 && m <= 12);
                }
                
                console.log(`📊 Dados do Supabase: ${dadosFiltrados.length} concursos`);
            }
        }
        
        // ============================================
        // CRIAR E TREINAR A IA
        // ============================================
        const ai = new AdvancedLotteryAI(
            dadosFiltrados,
            config.maxNumero,
            lottery,
            dadosExtrasFiltrados
        );
        ai.treinar();
        
        // ============================================
        // GERAR JOGOS COM A IA
        // ============================================
        const jogos: any[] = [];
        const dispersao = filters?.dispersao || 15;
        const modoIA = mode || 'ia_especialista';
        
        for (let i = 0; i < quantity; i++) {
            let numeros: number[] = [];
            let timeCoracao: string | null = null;
            let mesSorte: number | null = null;
            
            switch (modoIA) {
                case 'ia_especialista':
                    numeros = ai.predizerIAEspecialista(numerosPorJogo, true, dispersao, i);
                    break;
                case 'aleatorio_inteligente':
                    numeros = ai.predizerAleatorioInteligente(numerosPorJogo, true, dispersao);
                    break;
                case 'probabilistico':
                    numeros = ai.predizerProbabilistico(numerosPorJogo, true, dispersao);
                    break;
                case 'aleatorio_puro':
                default:
                    numeros = ai.predizerAleatorio(numerosPorJogo, i);
                    break;
            }
            
            // Timemania: gerar time do coração
            if (lottery === 'timemania') {
                timeCoracao = ai.predizerTimeSorte();
            }
            
            // Dia de Sorte: gerar mês da sorte
            if (lottery === 'diadesorte') {
                mesSorte = ai.predizerMesSorte();
            }
            
            const jogo: any = {
                numeros: numeros,
                confianca: ai.treinado ? Math.round(ai.confianca * (0.7 + Math.random() * 0.3)) : 50
            };
            
            if (timeCoracao) {
                jogo.timeCoracao = timeCoracao;
            }
            
            if (mesSorte !== null) {
                jogo.mesSorte = mesSorte;
            }
            
            jogos.push(jogo);
        }
        
        // ============================================
        // DEBITAR CRÉDITOS
        // ============================================
        let novoSaldo = user.creditos;
        if (custoTotal > 0) {
            novoSaldo = user.creditos - custoTotal;
            await supabase
                .from('usuarios')
                .update({ creditos: novoSaldo })
                .eq('uid', uid);
        }
        
        // ============================================
        // SALVAR HISTÓRICO
        // ============================================
        const timesArray = lottery === 'timemania' 
            ? jogos.map(j => j.timeCoracao).filter(t => t) 
            : [];
        
        const mesesArray = lottery === 'diadesorte'
            ? jogos.map(j => j.mesSorte).filter(m => m !== null)
            : [];
        
        await supabase
            .from('historico_palpites')
            .insert({
                usuario_uid: uid,
                loteria: lottery,
                jogos: jogos.map(j => j.numeros),
                quantidade_numeros: numerosPorJogo,
                filtros: {
                    modo: modoIA,
                    periodo: filters?.periodo || 'all',
                    dispersao: filters?.dispersao || 15
                },
                extras: jogos.map(j => ({
                    confianca: j.confianca || null,
                    timeCoracao: j.timeCoracao || null,
                    mesSorte: j.mesSorte || null
                })),
                times: timesArray.length > 0 ? timesArray : null,
                meses: mesesArray.length > 0 ? mesesArray : null,
                data: new Date().toISOString()
            });
        
        // ============================================
        // RETORNAR RESULTADO
        // ============================================
        return res.status(200).json({
            success: true,
            games: jogos,
            creditsSpent: custoTotal,
            creditsRemaining: novoSaldo,
            mode: modoIA,
            confiancaMedia: Math.round(jogos.reduce((sum, j) => sum + j.confianca, 0) / jogos.length)
        });
        
    } catch (error: any) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: error.message || 'Erro interno' });
    }
}
