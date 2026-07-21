// clients/RailwayClient.ts
// ============================================
// VERSÃO CORRIGIDA - SEM getConfig()
// ============================================

import { env } from '../core/config/env';

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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), env.railwayTimeout);

        try {
            const response = await fetch(`${this.url}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(params),
                signal: controller.signal
            });

            if (!response.ok) {
                // ✅ Separar erros: 404 = inválida, 500 = servidor
                if (response.status === 404) {
                    throw new Error(`Loteria não encontrada no Railway: ${params.lotteryType}`);
                }
                if (response.status === 500) {
                    throw new Error('Servidor de IA indisponível. Tente novamente mais tarde.');
                }
                const errorText = await response.text();
                throw new Error(`Railway error: ${response.status} - ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Railway returned success: false');
            }

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
