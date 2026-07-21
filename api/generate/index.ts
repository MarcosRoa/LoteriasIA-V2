import { RailwayClient } from '../../clients/RailwayClient';

export default async function handler(req, res) {
    new RailwayClient();

    return res.status(200).json({
        ok: "Railway"
    });
}
