export default async function handler(req, res) {
    try {
        throw new Error("TESTE_ERRO");
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err instanceof Error ? err.message : String(err)
        });
    }
}
