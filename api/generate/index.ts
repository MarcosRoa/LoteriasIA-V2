// api/generate/index.ts
// api/generate/index.ts 16/06/2026
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
}> = {
    megasena: { maxNumero: 60, numerosPadrao: 6 },
    quina: { maxNumero: 80, numerosPadrao: 5 },
    lotofacil: { maxNumero: 25, numerosPadrao: 15 },
    lotomania: { maxNumero: 99, numerosPadrao: 50 },
    duplasena: { maxNumero: 50, numerosPadrao: 6 },
    timemania: { maxNumero: 80, numerosPadrao: 10, temTime: true },
    milionaria: { maxNumero: 50, numerosPadrao: 6 },
    loteca: { maxNumero: 2, numerosPadrao: 14, permiteRepeticao: true, incluiZero: true },
    diadesorte: { maxNumero: 31, numerosPadrao: 7 },
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
    timesHistoricos: string[];

    constructor(dados: number[][], maxNumero: number, loteriaNome: string, dadosExtras: any[] = []) {
        this.dados = dados || [];
        this.maxNumero = maxNumero;
        this.loteriaNome = loteriaNome;
        this.dadosExtras = dadosExtras || [];
        this.treinado = false;
        this.confianca = 0;
        
        // 🔧 CORREÇÃO 1: Usar o nome da loteria diretamente
        const loteriaId = this.getLoteriaId(loteriaNome);
        const config = LOTTERY_CONFIGS[loteriaId];
        this.incluirZero = config?.incluiZero || false;
        this.minNumero = this.incluirZero ? 0 : 1;
        
        this.isLoteca = loteriaId === 'loteca';
        this.isTimemania = loteriaId === 'timemania';
        
        // 🔧 CORREÇÃO 2: Usar .flat() para achatar o array de arrays
        if (this.isTimemania && this.dadosExtras && this.dadosExtras.length > 0) {
            // dadosExtras pode vir como [['FLAMENGO'], ['VASCO']] ou ['FLAMENGO', 'VASCO']
            // .flat() garante que fique ['FLAMENGO', 'VASCO']
            const flattened = Array.isArray(this.dadosExtras[0]) 
                ? this.dadosExtras.flat() 
                : this.dadosExtras;
            
            this.timesHistoricos = flattened
                .filter(t => t !== null && t !== undefined && typeof t === 'string')
                .map(t => t.trim())
                .filter(t => t.length > 0);
        } else {
            this.timesHistoricos = [];
        }
    }

    // 🔧 CORREÇÃO 1: getLoteriaId simplificado
    getLoteriaId(nome: string): string {
        // Mapeamento para garantir compatibilidade
        const mapa: Record<string, string> = {
            'megasena': 'megasena',
            'mega-sena': 'megasena',
            'quina': 'quina',
            'lotofacil': 'lotofacil',
            'lotofácil': 'lotofacil',
            'lotomania': 'lotomania',
            'duplasena': 'duplasena',
            'dupla sena': 'duplasena',
            'timemania': 'timemania',
            'milionaria': 'milionaria',
            '+milionária': 'milionaria',
            'loteca': 'loteca',
            'diadesorte': 'diadesorte',
            'dia de sorte': 'diadesorte',
            'supersete': 'supersete',
            'super sete': 'supersete'
        };
        
        // Tentar o mapeamento direto ou converter para lower case
        const lowerNome = nome.toLowerCase().trim();
        return mapa[lowerNome] || lowerNome;
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
    // MÉTODO ALEATÓRIO CORRIGIDO
    // ============================================
    predizerAleatorio(qtd: number, seed: number = 0): number[] {
        // LOTECA: permite repetição
        if (this.isLoteca) {
            const jogo: number[] = [];
            for (let i = 0; i < qtd; i++) {
                jogo.push(Math.floor(Math.random() * 3));
            }
            return jogo;
        }
        
        // DEMAIS LOTERIAS: números únicos
        const res = new Set<number>();
        const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
        
        let tentativas = 0;
        const maxTentativas = 1000;
        
        while (res.size < qtd && tentativas < maxTentativas) {
            tentativas++;
            const num = Math.floor(Math.random() * (limite - this.minNumero)) + this.minNumero;
            res.add(num);
        }
        
        // Fallback: se não conseguiu todos, preencher com números aleatórios
        if (res.size < qtd) {
            const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
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
            while (resultado.size < qtd && disp.length > 0) {
                const idx = Math.floor(Math.random() * disp.length);
                resultado.add(disp[idx]);
                disp.splice(idx, 1);
            }
        }
        
        return Array.from(resultado).sort((a, b) => a - b);
    }

    // ============================================
    // MÉTODO PRINCIPAL IA ESPECIALISTA (COM PROTEÇÃO CONTRA LOOP)
    // ============================================
    predizerIAEspecialista(qtd: number, usarDispersao: boolean = true, windowDispersao: number = 10, seed: number = 0): number[] {
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
            const recentes = new Set<number>();
            this.dados.slice(-windowDispersao).forEach(jogo => jogo.forEach(n => recentes.add(n)));
            scoresRuido = scoresRuido.map(s => ({ ...s, score: recentes.has(s.numero) ? s.score * 0.1 : s.score }));
        }
        
        scoresRuido.sort((a, b) => b.score - a.score);
        
        const candidatos = scoresRuido.filter(s => s.numero >= this.minNumero).slice(0, Math.max(qtd * 2, 20));
        
        const resultado = new Set<number>();
        
        // 🔧 CORREÇÃO 4: Adicionar proteção contra loop infinito
        let tentativas = 0;
        const maxTentativas = 1000;
        
        while (resultado.size < qtd && tentativas < maxTentativas && candidatos.length > 0) {
            tentativas++;
            const idx = Math.floor(Math.random() * candidatos.length);
            resultado.add(candidatos[idx].numero);
            candidatos.splice(idx, 1);
        }
        
        // Fallback: se não conseguiu todos os números
        if (resultado.size < qtd) {
            const limite = this.maxNumero + (this.incluirZero ? 1 : 0);
            const todos = Array.from({ length: limite - this.minNumero }, (_, i) => i + this.minNumero);
            const disp = todos.filter(n => !resultado.has(n));
            let fallbackTentativas = 0;
            while (resultado.size < qtd && disp.length > 0 && fallbackTentativas < 1000) {
                fallbackTentativas++;
                const idx = Math.floor(Math.random() * disp.length);
                resultado.add(disp[idx]);
                disp.splice(idx, 1);
            }
            
            // Último recurso: forçar números únicos
            if (resultado.size < qtd) {
                for (let n = this.minNumero; n <= this.maxNumero && resultado.size < qtd; n++) {
                    resultado.add(n);
                }
            }
        }
        
        return Array.from(resultado).sort((a, b) => a - b);
    }

    // ============================================
    // MÉTODO PREDIZER TIME SORTE
    // ============================================
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
    
    const { uid, lottery, quantity, mode, extraNumbers, filters } = req.body;
    
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
        const { data: historico, error: histError } = await supabase
            .from('historico_resultados')
            .select('dados, dados_extras, data')
            .eq('loteria', lottery)
            .order('data', { ascending: false })
            .limit(1000);
        
        if (histError) throw histError;
        
        // Preparar dados para a IA
        const dados = historico?.map(item => item.dados) || [];
        const dadosExtras = historico?.map(item => item.dados_extras) || [];
        
        // Aplicar filtros de período (se fornecidos)
        let dadosFiltrados = dados;
        let dadosExtrasFiltrados = dadosExtras;
        
        if (filters?.periodo && filters.periodo !== 'all') {
            const anos = parseInt(filters.periodo);
            if (!isNaN(anos) && anos > 0) {
                const dataCorte = new Date();
                dataCorte.setFullYear(dataCorte.getFullYear() - anos);
                
                const indicesFiltrados: number[] = [];
                for (let i = 0; i < historico.length; i++) {
                    const data = new Date(historico[i].data);
                    if (data >= dataCorte) {
                        indicesFiltrados.push(i);
                    }
                }
                
                dadosFiltrados = indicesFiltrados.map(i => dados[i]);
                dadosExtrasFiltrados = indicesFiltrados.map(i => dadosExtras[i]);
            }
        }
        
        // ============================================
        // CRIAR E TREINAR A IA
        // ============================================
        // 🔧 CORREÇÃO 1: Usar lottery diretamente como nome
        const ai = new AdvancedLotteryAI(
            dadosFiltrados,
            config.maxNumero,
            lottery,  // ← AGORA usa 'loteca', 'timemania', etc.
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
            
            const jogo: any = {
                numeros: numeros,
                confianca: ai.treinado ? Math.round(ai.confianca * (0.7 + Math.random() * 0.3)) : 50
            };
            
            if (timeCoracao) {
                jogo.timeCoracao = timeCoracao;
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
        await supabase
            .from('historico_palpites')
            .insert({
                usuario_uid: uid,
                loteria: lottery,
                jogos: jogos.map(j => j.numeros),
                jogos_completos: jogos,
                quantidade_numeros: numerosPorJogo,
                modo: modoIA,
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
