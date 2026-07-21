import { GameRepository } from '../../repositories/GameRepository';

export default async function handler(req, res) {
    new GameRepository();

    return res.status(200).json({
        ok: "GameRepository"
    });
}
