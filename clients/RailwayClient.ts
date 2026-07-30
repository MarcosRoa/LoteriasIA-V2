// clients/RailwayClient.ts
// ============================================
// CLIENTE PARA COMUNICAÇÃO COM O RAILWAY (IA PURA)
// ============================================

import { env } from '../core/config/env.js';

export class RailwayClient {
    private url: string;
    private apiKey: string;

    constructor() {
        this.url = env.railwayUrl;
        this.apiKey = env.railwayApiKey;
    }

    async generateGames(params: {
        lotteryType: string;
        count: number;
        method: string;
        isPro: boolean;
        extraNumbers: number;
        filters: any;
    }) {
        console.log(`📤 RailwayClient: chamando Railway para ${params.lotteryType}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.railwayTimeout || 30000);

        try {
            const response = await fetch(`${this.url}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({
                    lotteryType: params.lotteryType,
                    count: params.count,
                    method: params.method,
                    ///////////////////////////////////
                    isPro: params.isPro,
                    extraNumbers: params.extraNumbers,
                    filters: params.filters || {}
                }),
                signal: controller.signal
////////////////////////////////////////////////////////
        console.log("📤 Payload Railway:");
        console.log(JSON.stringify(payload, null, 2));
        
        const response = await fetch(`${this.url}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey
                /////////////////////////////////
            },
            body: JSON.stringify(payload),
            signal: controller.signal
                
     });

            clearTimeout(timeoutId);

            // ✅ TRATAR RESPOSTA (pode ser HTML)
            const texto = await response.text();
            let data;

            try {
                data = JSON.parse(texto);
            } catch {
                console.error('⚠️ Railway respondeu com HTML/Texto:', texto.substring(0, 200));
                throw new Error(`Resposta inválida do servidor de IA: ${texto.substring(0, 200)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Railway error: ${response.status}`);
            }

            if (!data.success) {
                throw new Error(data.error || 'Railway returned success: false');
            }

            console.log(`✅ RailwayClient: ${data.games?.length || 0} jogos recebidos`);

            return {
                games: data.games || [],
                engineName: data.engineName || 'IA',
                confidence: data.confidence || 0,
                explanation: data.explanation || []
            };

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Tempo limite excedido ao chamar o Railway');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}
