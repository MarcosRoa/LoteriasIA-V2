export default async function handler(req, res) {
    return res.status(200).json({
        teste: "INDEX V2",
        timestamp: Date.now()
    });
}
