import { RailwayClient } from '../../clients/RailwayClient';

export default async function handler(req, res) {
    return res.status(200).json({
        imported: true
    });
}
