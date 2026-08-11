// ============================================
// CAMINHO: services/PaymentService.ts
// ============================================
// SERVIÇO DE PAGAMENTOS - VERSÃO CORRIGIDA 10/08/2026
// ============================================

import { createClient } from '@supabase/supabase-js';
import { ProService } from './ProService.js';
import { CreditsService } from './CreditsService.js';
import { CONSTANTS } from '../core/config/constants.js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class PaymentService {
    private mercadopagoAccessToken: string;
    private mercadopagoWebhookSecret: string;

    constructor() {
        this.mercadopagoAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
        this.mercadopagoWebhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
    }

    // ============================================
    // CRIAR PAGAMENTO PIX
    // ============================================
    async createPixPayment(data: {
        userId: string;
        userEmail: string;
        userName: string;
        productType: 'pro' | 'credits';
        productId?: string;
        idempotencyKey: string;
    }): Promise<any> {
        try {
            // ============================================
            // 1. VALIDAR E DEFINIR VALOR NO SERVIDOR
            // ============================================
            let amount: number;
            let description: string;
            let creditsToAdd = 0;

            if (data.productType === 'pro') {
                // PRO: R$ 20,00 por 15 dias
                amount = CONSTANTS.PRO_PRICE;
                description = 'Plano PRO (15 dias)';
            } else if (data.productType === 'credits') {
                const rawKey = data.productId?.replace('CREDITS_', '') || '12';
                const packageKey = Number(rawKey);

                if (isNaN(packageKey) || packageKey <= 0) {
                    return {
                        success: false,
                        error: 'Pacote de créditos inválido'
                    };
                }

                const packageValue = (CONSTANTS.CREDIT_PACKAGES as any)[packageKey];

                if (!packageValue) {
                    return {
                        success: false,
                        error: 'Pacote de créditos inválido'
                    };
                }

                amount = packageValue;
                creditsToAdd = packageValue;
                description = `${creditsToAdd} créditos`;
            } else {
                return {
                    success: false,
                    error: 'Tipo de produto inválido'
                };
            }

            // ============================================
            // 2. IMPEDIR NOVA COMPRA PRO ENQUANTO ATIVO
            // ============================================
            if (data.productType === 'pro') {
                const { data: user, error: userError } = await supabase
                    .from('usuarios')
                    .select('uid, is_pro, pro_expires_at')
                    .eq('uid', data.userId)
                    .maybeSingle();

                if (userError) {
                    console.error('❌ Erro ao consultar usuário:', userError);

                    return {
                        success: false,
                        error: 'Não foi possível verificar o status PRO'
                    };
                }

                if (!user) {
                    return {
                        success: false,
                        error: 'Usuário não encontrado'
                    };
                }

                const proAtivo =
                    user.is_pro === true &&
                    user.pro_expires_at &&
                    new Date(user.pro_expires_at) > new Date();

                if (proAtivo) {
                    return {
                        success: false,
                        error: 'Você já possui um plano PRO ativo'
                    };
                }
            }

            // ============================================
            // 3. VERIFICAR IDEMPOTÊNCIA
            // ============================================
            const existingPayment = await this.buscarPorIdempotencia(
                data.idempotencyKey
            );

            if (existingPayment) {
                return {
                    success: true,
                    paymentId: existingPayment.provider_payment_id,
                    qrCodeBase64: existingPayment.pix_qr_code,
                    qrCodeText: existingPayment.pix_copy_paste,
                    expiresAt: existingPayment.expires_at,
                    externalReference: existingPayment.external_reference,
                    amount: existingPayment.amount,
                    creditsToAdd: existingPayment.credits_generated,
                    message: 'Pagamento já criado anteriormente'
                };
            }

            // ============================================
            // 4. CRIAR REFERÊNCIA EXTERNA
            // ============================================
            const externalReference =
                `loterias-${data.productType}-${data.userId}-${Date.now()}`;

            const expiresAt = new Date(
                Date.now() + 30 * 60 * 1000
            );

            // ============================================
            // 5. CRIAR PAGAMENTO NO MERCADO PAGO
            // ============================================
            const response = await fetch(
                'https://api.mercadopago.com/v1/payments',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.mercadopagoAccessToken}`,
                        'X-Idempotency-Key': data.idempotencyKey
                    },
                    body: JSON.stringify({
                        transaction_amount: amount,
                        description,
                        payment_method_id: 'pix',
                        payer: {
                            email: data.userEmail,
                            first_name: data.userName
                        },
                        external_reference: externalReference,
                        metadata: {
                            user_id: data.userId,
                            product_type: data.productType,
                            credits_to_add: creditsToAdd,
                            idempotency_key: data.idempotencyKey
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.text();

                console.error(
                    '❌ Erro Mercado Pago:',
                    response.status,
                    errorData
                );

                return {
                    success: false,
                    error: `Erro no MP: ${response.status}`
                };
            }

            const paymentData = await response.json();

            const qrCodeBase64 =
                paymentData.point_of_interaction
                    ?.transaction_data
                    ?.qr_code_base64;

            const qrCodeText =
                paymentData.point_of_interaction
                    ?.transaction_data
                    ?.qr_code;

            // ============================================
            // 6. SALVAR PAGAMENTO NO BANCO
            // ============================================
            const { error: insertError } = await supabase
                .from('payments')
                .insert({
                    uid: data.userId,
                    provider: 'mercadopago',
                    provider_payment_id: String(paymentData.id),
                    amount,
                    credits_generated: creditsToAdd,
                    credits_amount: creditsToAdd,
                    status: 'pending',
                    pix_qr_code: qrCodeBase64,
                    pix_copy_paste: qrCodeText,
                    webhook_received: false,
                    webhook_attempts: 0,
                    payload: paymentData,
                    created_by_source: 'api',
                    product_type: data.productType,
                    idempotency_key: data.idempotencyKey,
                    external_reference: externalReference,
                    expires_at: expiresAt
                });

            if (insertError) {
                console.error(
                    '❌ Erro ao salvar pagamento:',
                    insertError
                );

                return {
                    success: false,
                    error: 'Pagamento criado no Mercado Pago, mas não foi possível registrar no banco'
                };
            }

            // ============================================
            // 7. RETORNAR DADOS PARA O APP
            // ============================================
            return {
                success: true,
                paymentId: String(paymentData.id),
                qrCodeBase64,
                qrCodeText,
                expiresAt: expiresAt.toISOString(),
                externalReference,
                amount,
                creditsToAdd
            };

        } catch (error: any) {
            console.error(
                '❌ Erro ao criar pagamento:',
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // CONSULTAR STATUS DO PAGAMENTO
    // ============================================
    async getPaymentStatus(paymentId: string): Promise<any> {
        try {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.mercadopagoAccessToken}`
                }
            });

            if (!response.ok) {
                return { success: false, error: 'Erro ao consultar pagamento' };
            }

            const data = await response.json();
            return {
                success: true,
                status: data.status,
                paymentData: data
            };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // PROCESSAR PAGAMENTO CONFIRMADO
    // ============================================
    async processarPagamento(payment: any): Promise<{ success: boolean; error?: string }> {
        try {
            // ✅ CORRIGIDO: Usar credits_generated (coluna real)
            const {
                uid,
                product_type,
                amount,
                provider_payment_id,
                credits_generated
            } = payment;
    
            console.log('🔍 DADOS DO PAGAMENTO:', {
                uid,
                product_type,
                amount,
                credits_generated,
                status: payment.status
            });
    
            // ============================================
            // 1. BUSCAR USUÁRIO
            // ============================================
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('uid, is_pro, pro_expires_at, creditos, email')
                .eq('uid', uid)
                .maybeSingle();
    
            if (error || !user) {
                console.error('❌ Usuário não encontrado:', { uid, error });
                return { success: false, error: 'Usuário não encontrado' };
            }
    
            console.log('✅ Usuário encontrado:', user.uid);
    
            // ============================================
            // 2. PROCESSAR POR TIPO
            // ============================================
            if (product_type === 'pro') {
                return await this.processarPro(user);
            } else if (product_type === 'credits') {
                return await this.processarCredits(
                    user,
                    credits_generated || amount
                );
            }
    
            return { success: false, error: `Tipo inválido: ${product_type}` };
    
        } catch (error: any) {
            console.error('❌ Erro ao processar pagamento:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // ATIVAR PRO (USANDO RPC DO BANCO)
    // ============================================
    private async processarPro(
        user: any
    ): Promise<{ success: boolean; error?: string }> {
        try {
            // ============================================
            // 1. VERIFICAR SE O PRO AINDA ESTÁ ATIVO
            // ============================================
            const proAtivo =
                user.is_pro === true &&
                user.pro_expires_at &&
                new Date(user.pro_expires_at) > new Date();

            if (proAtivo) {
                return {
                    success: false,
                    error: 'Usuário já possui um plano PRO ativo'
                };
            }

            // ============================================
            // 2. ATIVAR PRO PELO BANCO
            // ============================================
            const { data, error } = await supabase.rpc(
                'ativar_pro',
                {
                    user_uid: user.uid,
                    valor_pagamento: CONSTANTS.PRO_PRICE,
                    dias_validade: CONSTANTS.PRO_DURATION_DAYS
                }
            );

            if (error) {
                console.error(
                    '❌ Erro RPC ativar_pro:',
                    error
                );

                throw error;
            }

            if (data !== true) {
                throw new Error(
                    'A função ativar_pro não confirmou a ativação'
                );
            }

            console.log(
                `✅ PRO ativado para ${user.uid} por ${CONSTANTS.PRO_DURATION_DAYS} dias`
            );

            return {
                success: true
            };

        } catch (error: any) {
            console.error(
                '❌ Erro ao ativar PRO:',
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================
    // ADICIONAR CRÉDITOS
    // ============================================
    private async processarCredits(user: any, creditsToAdd: number): Promise<{ success: boolean; error?: string }> {
        try {
            const creditsService = new CreditsService();
            const newBalance = await creditsService.addCredits(user.uid, creditsToAdd);

            await this.registrarTransacao({
                user_id: user.uid,
                type: 'compra_creditos',
                amount: creditsToAdd,
                description: `Compra de ${creditsToAdd} créditos`,
                metadata: { new_balance: newBalance }
            });

            return { success: true };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // VALIDAR WEBHOOK (OFICIAL)
    // ============================================
    async validarWebhook(request: any): Promise<{ valid: boolean; error?: string }> {
        try {
            console.log('🔍 VALIDANDO WEBHOOK:');
            console.log('  Headers recebidos:', Object.keys(request.headers));
            console.log('  x-signature:', request.headers['x-signature']);
            console.log('  x-request-id:', request.headers['x-request-id']);
            
            const signature = request.headers['x-signature'];
            const requestId = request.headers['x-request-id'];
    
            if (!signature || !requestId) {
                return { valid: false, error: 'Headers de assinatura ausentes' };
            }
    
            const body = request.body;
            const paymentId = body.data?.id;
    
            if (!paymentId) {
                return { valid: false, error: 'ID do pagamento ausente' };
            }
    
            // 🔥 LOGS DE DIAGNÓSTICO
            console.log('🔍 BUSCANDO PAGAMENTO:');
            console.log('  paymentId recebido:', paymentId);
            console.log('  paymentId type:', typeof paymentId);
    
            const { data: payment, error } = await supabase
                .from('payments')
                .select('*')
                .eq('provider_payment_id', String(paymentId))
                .maybeSingle();
    
            console.log('🔍 RESULTADO DA CONSULTA:');
            console.log('  payment encontrado:', !!payment);
            console.log('  payment:', payment);
            console.log('  error:', error);
    
            if (!payment) {
                return { valid: false, error: 'Pagamento não encontrado' };
            }
    
            // 🔥 Consultar Mercado Pago para confirmar
            const mpResponse = await this.getPaymentStatus(paymentId);
            if (!mpResponse.success || mpResponse.status !== 'approved') {
                return { valid: false, error: 'Pagamento não confirmado no MP' };
            }
    
            return { valid: true };
    
        } catch (error: any) {
            console.error('❌ Erro no validarWebhook:', error);
            return { valid: false, error: error.message };
        }
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================
    private async buscarPorIdempotencia(key: string): Promise<any> {
        const { data } = await supabase
            .from('payments')
            .select('*')
            .eq('idempotency_key', key)
            .maybeSingle();
        return data;
    }

    private async registrarTransacao(data: any): Promise<void> {
        try {
            await supabase
                .from('transacoes')
                .insert({
                    usuario_uid: data.user_id,
                    tipo: data.type,
                    quantidade: data.amount,
                    saldo_apos: 0,
                    referencia: data.description,
                    metadata: data.metadata || {},
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('❌ Erro ao registrar transação:', error);
        }
    }
}
