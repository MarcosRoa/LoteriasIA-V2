// api/test-repository.js
import { GameRepository } from '../repositories/GameRepository';

export default async function handler(req, res) {
    try {
        console.log('1. Testando GameRepository...');
        const repo = new GameRepository();
        console.log('2. GameRepository OK!');
        return res.status(200).json({ ok: true, repo: 'GameRepository' });
    } catch (error) {
        console.error('❌ Erro:', error);
        return res.status(500).json({ 
            ok: false, 
            error: error.message,
            stack: error.stack 
        });
    }
}
