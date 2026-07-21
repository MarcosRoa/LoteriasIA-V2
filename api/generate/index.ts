import { GenerateService } from '../../services/GenerateService';

export default async function handler(req, res) {

    console.log("PASSO 1");

    const service = new GenerateService();

    console.log("PASSO 2");

    return res.status(200).json({
        ok: true
    });
}
