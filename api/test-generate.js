// api/test-generate.js
import { GenerateService } from '../../services/GenerateService.js';

export default async function handler(req, res) {
    try {
        console.log('🚀 Teste: Criando GenerateService...');
        const service = new GenerateService();
        
        console.log('🚀 Teste: Chamando generateGames...');
        const result = await service.generateGames({
            uid: 'Rt9OWiENvmV1Z4eo9iOrWlnuzq63',
            lottery: 'megasena',
            quantity: 1,
            method: 'hybrid'
        });
        
        console.log('🚀 Teste: Sucesso!', result);
        return res.json({ success: true, result });
        
    } catch (error) {
        console.error('❌ ERRO NO TESTE:', error);
        
        // Tentar extrair a mensagem real
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
            error: message,
            tipo: typeof error,
            isError: error instanceof Error,
            temStack: !!(error instanceof Error && error.stack)
        });
    }
}
