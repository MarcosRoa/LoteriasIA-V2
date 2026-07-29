// ============================================
// CAMINHO: api/payment/create.ts
// ============================================
// CRIA PAGAMENTO PIX - MERCADO PAGO
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const uid = req.headers['x-user-id'] || req.body?.uid;
        if (!uid) {
            return res.status(400).json({ error: 'UID é obrigatório' });
        }

        const { type, productId } = req.body;
        if (!type) {
            return res.status(400).json({ error: 'Tipo é obrigatório' });
        }

        const { data: user, error } = await supabase
            .from('usuarios')
            .select('uid, email, nome')
            .eq('uid', uid)
            .maybeSingle();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const paymentService = new PaymentService();
        const result = await paymentService.createPixPayment({
            userId: uid,
            userEmail: user.email,
            userName: user.nome || 'Usuário',
            productType: type,
            productId: productId,
            idempotencyKey: `${uid}-${type}-${Date.now()}`
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error || 'Erro ao criar pagamento'
            });
        }

        // ✅ GRAVAR NO BANCO
        const { error: insertError } = await supabase
            .from('payments')
            // ✅ GRAVAR NO BANCO
        console.log('📝 DADOS PARA INSERT:', {
            uid: uid,
            provider: 'mercadopago',
            provider_payment_id: String(result.paymentId),
            status: 'pending',
            product_type: type,
            amount: result.amount,
            credits_amount: result.creditsToAdd || 0
        });
        
        const { error: insertError } = await supabase
            .from('payments')
            .insert({
                uid: uid,
                provider: 'mercadopago',
                provider_payment_id: String(result.paymentId),
                status: 'pending',
                product_type: type,
                amount: result.amount,
                credits_amount: result.creditsToAdd || 0,
                pix_qr_code: result.qrCodeBase64,
                pix_copy_paste: result.qrCodeText,
                external_reference: result.externalReference,
                idempotency_key: `${uid}-${type}-${Date.now()}`,
                payload: { ...result },
                expires_at: result.expiresAt,
                created_by_source: 'api'
            });
        
        if (insertError) {
            console.error('❌ ERRO AO SALVAR:', insertError);
            console.error('  Code:', insertError.code);
            console.error('  Message:', insertError.message);
            console.error('  Details:', insertError.details);
        } else {
            console.log('✅ PAGAMENTO SALVO COM SUCESSO!');
        }

        // ✅ RETORNAR COM amount E creditsToAdd
        return res.status(200).json({
            success: true,
            paymentId: result.paymentId,
            qrCode: result.qrCodeBase64,
            qrCodeText: result.qrCodeText,
            expiresAt: result.expiresAt,
            externalReference: result.externalReference,
            amount: result.amount,
            creditsToAdd: result.creditsToAdd,
            message: 'Pagamento PIX criado. Aguarde a confirmação.'
        });

    } catch (error: any) {
        console.error('❌ Erro ao criar pagamento:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao criar pagamento'
        });
    }
}
