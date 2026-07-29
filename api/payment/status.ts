// ============================================
// CAMINHO: api/payment/status.ts
// ============================================
// CONSULTAR STATUS DO PAGAMENTO  28/07/2026
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PaymentService } from '../../services/PaymentService.js';

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

        // Buscar no banco
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_id', paymentId)
            .maybeSingle();

        if (error || !payment) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        // Se já está confirmado, retornar
        if (payment.status === 'confirmed') {
            return res.status(200).json({
                success: true,
                status: 'confirmed',
                payment: payment
            });
        }

        // Consultar Mercado Pago
        const paymentService = new PaymentService();
        const mpStatus = await paymentService.getPaymentStatus(paymentId);

        if (mpStatus.success && mpStatus.status === 'approved') {
            // Processar pagamento
            const result = await paymentService.processarPagamento(payment);
            if (result.success) {
                await supabase
                    .from('payments')
                    .update({
                        status: 'confirmed',
                        confirmed_at: new Date().toISOString()
                    })
                    .eq('id', payment.id);
                return res.status(200).json({
                    success: true,
                    status: 'confirmed',
                    payment: { ...payment, status: 'confirmed' }
                });
            }
        }

        return res.status(200).json({
            success: true,
            status: payment.status || 'pending'
        });

    } catch (error: any) {
        console.error('❌ Erro ao consultar status:', error);
        return res.status(500).json({ error: error.message });
    }
}
