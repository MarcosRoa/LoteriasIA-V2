import { CreditsService } from '../../services/CreditsService';

export default async function handler(req, res) {

    new CreditsService();

    return res.json({
        ok: "Credits"
    });

}
