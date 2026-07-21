import { GenerateService } from '../../services/GenerateService';

export default async function handler(req, res) {
    try {
        console.log("ANTES");

        const service = new GenerateService();

        console.log("DEPOIS");

        return res.json({
            ok: true
        });
    } catch (e) {
        console.error("ERRO:", e);

        return res.status(500).json({
            error: e instanceof Error ? e.message : String(e)
        });
    }
}
