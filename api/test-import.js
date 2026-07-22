import { GenerateService } from '../../services/GenerateService';
export default function handler(req, res) {
    return res.status(200).json({
        ok: true,
        importou: 'RailwayClient'
    });
}
