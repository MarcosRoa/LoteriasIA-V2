// api/test-credits.js
import { CreditsService } from '../services/CreditsService.js';

export default async function handler(req, res) {
    try {
        console.log('🚀 Teste: Criando CreditsService...');
        const service = new CreditsService();
        
        console.log('🚀 Teste: Chamando getBalance...');
        const balance = await service.getBalance('Rt9OWiENvmV1Z4eo9iOrWlnuzq63');
        
        console.log('🚀 Teste: Sucesso!', balance);
        return res.json({ success: true, balance });
        
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
