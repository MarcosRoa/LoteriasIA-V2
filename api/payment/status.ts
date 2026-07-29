// ============================================
// CAMINHO: api/payment/status.ts
// ============================================
// CONSULTAR STATUS DO PAGAMENTO
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    try {
        const paymentId = req.query.paymentId as string;
        if (!paymentId) {
            return res.status(400).json({ error: 'paymentId é obrigatório' });
        }

        // ✅ Usar provider_payment_id (padronizado)
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('provider_payment_id', paymentId)
            .maybeSingle();

        if (error || !payment) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        return res.status(200).json({
            success: true,
            status: payment.status,
            payment: {
                id: payment.id,
                user_id: payment.user_id,
                product_type: payment.product_type,
                amount: payment.amount,
                credits_amount: payment.credits_amount,
                status: payment.status,
                created_at: payment.created_at,
                confirmed_at: payment.confirmed_at,
                provider_payment_id: payment.provider_payment_id
            }
        });

    } catch (error: any) {
        console.error('❌ Erro ao consultar status:', error);
        return res.status(500).json({ error: error.message });
    }
}
