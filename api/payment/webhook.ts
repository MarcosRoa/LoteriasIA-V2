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
    
    // ============================================
    // 🔥 LOG 1: VER O QUE CHEGA
    // ============================================
    console.log('🔍 WEBHOOK RECEBIDO:');
    console.log('  Headers:', JSON.stringify(req.headers, null, 2));
    console.log('  Body:', JSON.stringify(req.body, null, 2));
    console.log('  Method:', req.method);
    
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
        // ============================================
        // 🔥 LOG 3: VER O PAYMENT ID E A BUSCA
        // ============================================
        console.log('🔍 BUSCANDO PAGAMENTO:');
        console.log('  paymentId:', paymentId);
        console.log('  Tipo:', typeof paymentId);
        // ============================================
        // 3. BUSCAR PAGAMENTO NO BANCO
        // ============================================
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('provider_payment_id', String(paymentId))  // ← COLUNA CORRETA
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
        // 5. ATUALIZAR BANCO (PRIMEIRO)
        // ============================================
        await supabase
            .from('payments')
            .update({
                status: 'confirmed',
                approved_at: new Date().toISOString(),
                payload: req.body,
                webhook_received: true
            })
            .eq('id', payment.id);
        
        console.log(`✅ Status do pagamento ${paymentId} atualizado para confirmed`);
        
        // ============================================
        // 6. PROCESSAR PAGAMENTO (DEPOIS)
        // ============================================
        const result = await paymentService.processarPagamento(payment);
        
        if (!result.success) {
            console.error('❌ Erro ao processar pagamento:', result.error);
            // Não falha a requisição, apenas log (o status já foi atualizado)
            return res.status(200).json({ 
                success: true, 
                warning: 'Status atualizado, mas processamento falhou' 
            });
        }
        
        console.log(`✅ Pagamento ${paymentId} processado com sucesso`);
        return res.status(200).json({ success: true });
