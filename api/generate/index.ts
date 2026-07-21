import { RailwayClient } from '../../clients/RailwayClient';

export default async function handler(req, res) {
    try {
        console.log('1');

        const client = new RailwayClient();

        console.log('2');

        return res.json({
            ok: true
        });

    } catch (e) {
        console.error(e);

        return res.status(500).json({
            error: e instanceof Error ? {
                message: e.message,
                stack: e.stack
            } : String(e)
        });
    }
}
