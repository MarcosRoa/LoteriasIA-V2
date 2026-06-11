// api/ping-simple.js
export default function handler(req, res) {
    res.status(200).json({
        success: true,
        message: 'Vercel está funcionando!',
        timestamp: new Date().toISOString()
    });
}
