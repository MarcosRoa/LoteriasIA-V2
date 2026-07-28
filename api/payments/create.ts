// ============================================
// CAMINHO: api/payment/create.ts
// ============================================
// CRIA PAGAMENTO PIX - MERCADO PAGO  28/07/2026
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
        // ============================================
        // 1. VALIDAR USUÁRIO
        // ============================================
        const uid = req.headers['x-user-id'] || req.body?.uid;
        if (!uid) {
            return res.status(400).json({ error: 'UID é obrigatório' });
        }

        // ✅ ADICIONAR productId
        const { type, productId } = req.body; // type: 'pro' | 'credits', productId: 'PRO' | 'CREDITS_24'
        
        if (!type) {
            return res.status(400).json({ error: 'Tipo é obrigatório' });
        }
        
        
        // ============================================
        // 2. BUSCAR USUÁRIO
        // ============================================
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('uid, email, nome')
            .eq('uid', uid)
            .maybeSingle();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // ============================================
        // 3. CRIAR PAGAMENTO NO MERCADO PAGO
        // ============================================
        const paymentService = new PaymentService();
        const result = await paymentService.createPixPayment({
            userId: uid,
            userEmail: user.email,
            userName: user.nome || 'Usuário',
            productType: type,      // ← 'pro' ou 'credits'
            productId: productId,   // ← 'PRO' ou 'CREDITS_24'
            idempotencyKey: `${uid}-${type}-${Date.now()}`
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error || 'Erro ao criar pagamento'
            });
        }

        // ============================================
        // 4. SALVAR NO BANCO (payments)
        // ============================================
        const { data: payment, error: insertError } = await supabase
            .from('payments')
            .insert({
                user_id: uid,
                gateway: 'mercadopago',
                payment_id: result.paymentId,
                status: 'pending',
                type: type,
                amount: result.amount || 0,
                credits_amount: result.creditsToAdd || 0,
                qr_code: result.qrCodeBase64,
                qr_code_text: result.qrCodeText,
                external_reference: result.externalReference,
                payment_data: result.paymentData,
                expires_at: result.expiresAt
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('❌ Erro ao salvar pagamento:', insertError);
            // Não falha a requisição, apenas log
        }

        // ============================================
        // 5. RETORNAR QR CODE
        // ============================================
        return res.status(200).json({
            success: true,
            paymentId: result.paymentId,
            qrCode: result.qrCodeBase64,
            qrCodeText: result.qrCodeText,
            expiresAt: result.expiresAt,
            externalReference: result.externalReference,
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
