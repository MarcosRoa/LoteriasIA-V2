// api/generate/index.ts  02/07/2026
// api/generate/index.ts - VERSÃO SIMPLIFICADA PARA TESTE
// api/generate/index.ts - VERSÃO DE TESTE COM FALLBACK
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// 🔥 TENTAR CARREGAR A IA
let AdvancedLotteryAI: any;
let IA_CARREGADA = false;

try {
    // Tentar importar a IA
    const module = await import('./AdvancedLotteryAI');
    AdvancedLotteryAI = module.AdvancedLotteryAI;
    IA_CARREGADA = true;
    console.log('✅ AdvancedLotteryAI carregado com sucesso!');
} catch (error) {
    console.log('⚠️ AdvancedLotteryAI não encontrado, usando fallback');
    // Fallback: classe simplificada
    AdvancedLotteryAI = class FallbackAI {
        private dados: any[];
        private config: any;
        constructor(dados: any[], config: any) {
            this.dados = dados;
            this.config = config;
        }
        treinar() { return this.dados.length >= 10; }
        predizerIAEspecialista(quantidade: number, usarDispersao: boolean = true, windowDispersao: number = 15, seed: number = 0) {
            const numeros = new Set<number>();
            const min = this.config.incluirZero ? 0 : 1;
            const max = this.config.maxNumero;
            while (numeros.size < quantidade) {
                numeros.add(Math.floor(Math.random() * (max - min + 1)) + min);
            }
            return Array.from(numeros).sort((a, b) => a - b);
        }
        gerarAleatorio(quantidade: number) {
            const numeros = new Set<number>();
            const min = this.config.incluirZero ? 0 : 1;
            const max = this.config.maxNumero;
            while (numeros.size < quantidade) {
                numeros.add(Math.floor(Math.random() * (max - min + 1)) + min);
            }
            return Array.from(numeros).sort((a, b) => a - b);
        }
        gerarRelatorio() {
            return { confiancaGeral: 0, totalDados: 0, loteria: '', treinado: false };
        }
    };
}

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ... RESTANTE DO CÓDIGO IGUAL AO QUE ESTÁ FUNCIONANDO

// ============================================
// CONFIGURAÇÕES
// ============================================

const LOTTERY_CONFIGS: Record<string, { 
    nome: string; 
    maxNumero: number; 
    numerosPadrao: number; 
    incluirZero: boolean; 
}> = {
    megasena: { nome: 'Mega-Sena', maxNumero: 60, numerosPadrao: 6, incluirZero: false },
    quina: { nome: 'Quina', maxNumero: 80, numerosPadrao: 5, incluirZero: false },
    lotofacil: { nome: 'Lotofácil', maxNumero: 25, numerosPadrao: 15, incluirZero: false },
    lotomania: { nome: 'Lotomania', maxNumero: 99, numerosPadrao: 50, incluirZero: true },
    duplasena: { nome: 'Dupla Sena', maxNumero: 50, numerosPadrao: 6, incluirZero: false },
    timemania: { nome: 'Timemania', maxNumero: 80, numerosPadrao: 10, incluirZero: false },
    milionaria: { nome: '+Milionária', maxNumero: 50, numerosPadrao: 6, incluirZero: false },
    loteca: { nome: 'Loteca', maxNumero: 3, numerosPadrao: 14, incluirZero: true },
    diadesorte: { nome: 'Dia de Sorte', maxNumero: 31, numerosPadrao: 7, incluirZero: false },
    supersete: { nome: 'Super Sete', maxNumero: 9, numerosPadrao: 7, incluirZero: true }
};

// ============================================
// FUNÇÃO PARA GERAR NÚMEROS ALEATÓRIOS
// ============================================

function gerarNumerosAleatorios(quantidade: number, maxNumero: number, incluirZero: boolean): number[] {
    const numeros = new Set<number>();
    const min = incluirZero ? 0 : 1;
    
    while (numeros.size < quantidade) {
        const num = Math.floor(Math.random() * (maxNumero - min + 1)) + min;
        numeros.add(num);
    }
    
    return Array.from(numeros).sort((a, b) => a - b);
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    try {
        console.log('📥 Requisição recebida em /api/generate');
        
        const { uid, lottery, quantity, mode, extraNumbers } = req.body;
        
        console.log('📊 Dados recebidos:', { uid, lottery, quantity, mode, extraNumbers });
        
        // Validar campos obrigatórios
        if (!uid) {
            return res.status(400).json({ error: 'uid é obrigatório' });
        }
        
        if (!lottery) {
            return res.status(400).json({ error: 'lottery é obrigatório' });
        }
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'quantity deve ser maior que 0' });
        }
        
        const config = LOTTERY_CONFIGS[lottery];
        if (!config) {
            return res.status(400).json({ error: `Loteria inválida: ${lottery}` });
        }
        
        const numerosPorJogo = extraNumbers || config.numerosPadrao;
        const quantidadeJogos = Math.min(quantity, 10); // Limitar a 10 jogos por segurança
        
        console.log(`🎯 Gerando ${quantidadeJogos} jogos para ${config.nome} com ${numerosPorJogo} números cada`);
        
        // Gerar jogos
        const jogos: number[][] = [];
        for (let i = 0; i < quantidadeJogos; i++) {
            const jogo = gerarNumerosAleatorios(numerosPorJogo, config.maxNumero, config.incluirZero);
            jogos.push(jogo);
        }
        
        console.log(`✅ ${jogos.length} jogos gerados com sucesso`);
        
        return res.status(200).json({
            success: true,
            games: jogos,
            creditsSpent: quantity * 2,
            creditsRemaining: 100 - (quantity * 2),
            mode: mode || 'ia_especialista',
            iaUsed: false,
            totalHistorico: 0
        });
        
    } catch (error: any) {
        console.error('❌ Erro no handler:', error);
        return res.status(500).json({ 
            error: error.message || 'Erro interno do servidor',
            stack: error.stack
        });
    }
}
