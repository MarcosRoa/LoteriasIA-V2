// api/test-railway.js
import { RailwayClient } from '../clients/RailwayClient';

export default async function handler(req, res) {
    try {
        console.log('1. Testando RailwayClient...');
        const client = new RailwayClient();
        console.log('2. RailwayClient OK!');
        return res.status(200).json({ ok: true, client: 'RailwayClient' });
    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ 
            ok: false, 
            error: error.message,
            stack: error.stack 
        });
    }
}
