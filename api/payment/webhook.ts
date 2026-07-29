// ============================================
// CAMINHO: api/payment/webhook.ts
// ============================================
// WEBHOOK GENÉRICO (MERCADO PAGO)  28/07/2026
// ============================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { PaymentService } from '../../services/PaymentService.js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    
    console.log('🔍 WEBHOOK RECEBIDO:');
    console.log('  Headers:', req.headers);
    console.log('  Body:', req.body);
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ============================================
        // 1. VALIDAR WEBHOOK
        // ============================================
        const paymentService = new PaymentService();
        const validation = await paymentService.validarWebhook(req);
        
        if (!validation.valid) {
            console.warn('⚠️ Webhook inválido:', validation.error);
            return res.status(401).json({ error: validation.error });
        }

        // ============================================
        // 2. EXTRAIR PAYMENT ID
        // ============================================
        const paymentId = req.body.data?.id;
        if (!paymentId) {
            return res.status(400).json({ error: 'ID do pagamento ausente' });
        }
        console.log('🔍 WEBHOOK RECEBIDO:');
        console.log('  Headers:', req.headers);
        console.log('  Body:', req.body);
        // ============================================
        // 3. BUSCAR PAGAMENTO NO BANCO
        // ============================================
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('payment_id', String(paymentId))
            .maybeSingle();

        if (error || !payment) {
            console.warn(`⚠️ Pagamento não encontrado: ${paymentId}`);
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        // ============================================
        // 4. EVITAR DUPLICIDADE
        // ============================================
        if (payment.status === 'confirmed') {
            return res.status(200).json({ message: 'Pagamento já processado' });
        }

        // ============================================
        // 5. PROCESSAR PAGAMENTO
        // ============================================
        const result = await paymentService.processarPagamento(payment);

        if (!result.success) {
            console.error('❌ Erro ao processar pagamento:', result.error);
            return res.status(500).json({ error: result.error });
        }

        // ============================================
        // 6. ATUALIZAR BANCO
        // ============================================
        await supabase
            .from('payments')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                payment_data: req.body
            })
            .eq('id', payment.id);

        console.log(`✅ Pagamento ${paymentId} processado com sucesso`);
        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('❌ Erro no webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}
