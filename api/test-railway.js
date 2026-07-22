// api/test-railway.js
import { RailwayClient } from '../../clients/RailwayClient.js';

export default async function handler(req, res) {
    try {
        console.log('🚀 Teste: Criando RailwayClient...');
        const client = new RailwayClient();
        
        console.log('🚀 Teste: Chamando generateGames...');
        const result = await client.generateGames({
            lotteryType: 'megasena',
            count: 1,
            method: 'hybrid',
            isPro: false,
            extraNumbers: 6,
            filters: {}
        });
        
        console.log('🚀 Teste: Sucesso!', result);
        return res.json({ success: true, result });
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        
        let message = 'Erro desconhecido';
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error && typeof error === 'object') {
            message = JSON.stringify(error);
        }
        
        return res.status(500).json({
            success: false,
            error: message
        });
    }
}
