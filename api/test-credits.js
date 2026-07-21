// api/test-credits.js
import { CreditsService } from '../services/CreditsService';

export default async function handler(req, res) {
    try {
        console.log('1. Testando CreditsService...');
        const service = new CreditsService();
        console.log('2. CreditsService OK!');
        return res.status(200).json({ ok: true, service: 'CreditsService' });
    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ 
            ok: false, 
            error: error.message,
            stack: error.stack 
        });
    }
}
