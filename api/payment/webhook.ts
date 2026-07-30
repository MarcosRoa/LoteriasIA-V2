// ============================================
// CAMINHO: api/payment/webhook.ts
// ============================================
// WEBHOOK GENÉRICO (MERCADO PAGO) 
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

        console.log('🔍 BUSCANDO PAGAMENTO:');
        console.log('  paymentId:', paymentId);
        console.log('  Tipo:', typeof paymentId);

        // ============================================
        // 3. BUSCAR PAGAMENTO NO BANCO
        // ============================================
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('provider_payment_id', String(paymentId))
            .maybeSingle();
        
        if (error || !payment) {
            console.warn(`⚠️ Pagamento não encontrado: ${paymentId}`);
            // ✅ MUDAR PARA 200 (evita reenvio do Mercado Pago)
            return res.status(200).json({ 
                success: false, 
                message: 'Pagamento não encontrado (já processado ou teste)',
                paymentId: paymentId
            });
        }
        
        console.log('✅ Pagamento encontrado:', {
            id: payment.id,
            provider_payment_id: payment.provider_payment_id,
            status: payment.status
        });
        
        // ============================================
        // 4. EVITAR DUPLICIDADE
        // ============================================
        if (payment.status === 'approved' || payment.status === 'confirmed') {
            return res.status(200).json({ message: 'Pagamento já processado' });
        }
        // ============================================
        // 5. ATUALIZAR BANCO (COM VERIFICAÇÃO)
        // ============================================
        console.log('🔍 ATUALIZANDO PAGAMENTO:');
        console.log('  payment.id:', payment.id);
        console.log('  status atual:', payment.status);

        const { data: updated, error: updateError } = await supabase
            .from('payments')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                payload: req.body,
                webhook_received: true
            })
            .eq('id', payment.id)
            .select();

        console.log('==============================');
        console.log('UPDATE ERROR:', updateError);
        console.log('UPDATE DATA:', updated);
        console.log('PAYMENT.ID:', payment.id);
        console.log('UPDATE ERROR:', updateError);
        console.log('UPDATE DATA:', updated);
        console.log('==============================');

        if (updateError) {
            console.error('❌ ERRO NO UPDATE:', updateError);
            return res.status(500).json({ error: updateError.message });
        }

        if (!updated || updated.length === 0) {
            console.error('❌ NENHUMA LINHA FOI ATUALIZADA!');
            console.error('  payment.id:', payment.id);
            console.error('  Verifique se o ID existe no banco');
            
            // 🔥 VERIFICAR SE O REGISTRO EXISTE
            const { data: check, error: checkError } = await supabase
                .from('payments')
                .select('id, status, approved_at')
                .eq('id', payment.id)
                .single();
            
            console.log('🔍 VERIFICAÇÃO PÓS-UPDATE:');
            console.log('VERIFY ERROR:', checkError);
            console.log('VERIFY DATA:', check);
            console.log('  check:', check);
            console.log('  checkError:', checkError);
            
            return res.status(500).json({ 
                error: 'Registro não encontrado para atualização',
                paymentId: payment.id
            });
        }

        console.log(`✅ Status do pagamento ${paymentId} atualizado para confirmed`);

        // ============================================
        // 6. PROCESSAR PAGAMENTO (DEPOIS)
        // ============================================
        const result = await paymentService.processarPagamento(payment);

        if (!result.success) {
            console.error('❌ Erro ao processar pagamento:', result.error);
            return res.status(200).json({ 
                success: true, 
                warning: 'Status atualizado, mas processamento falhou' 
            });
        }

        console.log(`✅ Pagamento ${paymentId} processado com sucesso`);
        return res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('❌ Erro no webhook:', error);
        return res.status(500).json({ error: error.message });
    }
}
