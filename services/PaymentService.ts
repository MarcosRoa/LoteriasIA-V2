// ============================================
// CAMINHO: services/PaymentService.ts
// ============================================
// SERVIÇO DE PAGAMENTOS - VERSÃO CORRIGIDA 29/07/2026
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
    // CRIAR PAGAMENTO PIX (COM VALIDAÇÃO)
    // ============================================
    async createPixPayment(data: {
        userId: string;
        userEmail: string;
        userName: string;
        productType: 'pro' | 'credits';
        productId?: string; // Para créditos: '12', '24', '36', etc.
        idempotencyKey: string;
    }): Promise<any> {
        try {
            // ============================================
            // 1. VALIDAR E DEFINIR VALOR (SERVIDOR)
            // ============================================
            let amount: number;
            let description: string;
            let creditsToAdd: number = 0;
            
            if (data.productType === 'pro') {
                amount = CONSTANTS.PRO_PRICE;
                description = 'Assinatura PRO (15 dias)';
            } else if (data.productType === 'credits') {
                // ✅ EXTRAIR O NÚMERO DO PACOTE
                const rawKey = data.productId?.replace('CREDITS_', '') || '12';
                const packageKey = Number(rawKey);
                
                // ✅ VALIDAR SE É UM NÚMERO VÁLIDO
                if (isNaN(packageKey) || packageKey <= 0) {
                    return { success: false, error: 'Pacote de créditos inválido' };
                }
                
                // ✅ BUSCAR O VALOR (USANDO ANY PARA CONTORNAR O TIPO)
                const packageValue = (CONSTANTS.CREDIT_PACKAGES as any)[packageKey];
                
                if (!packageValue) {
                    return { success: false, error: 'Pacote de créditos inválido' };
                }
                
                amount = packageValue;
                creditsToAdd = packageValue;
                description = `${creditsToAdd} créditos`;
            } else {
                return { success: false, error: 'Tipo de produto inválido' };
            }

            // ============================================
            // 2. VERIFICAR IDEMPOTÊNCIA
            // ============================================
            const existingPayment = await this.buscarPorIdempotencia(data.idempotencyKey);
            if (existingPayment) {
                return {
                    success: true,
                    paymentId: existingPayment.payment_id,
                    qrCodeBase64: existingPayment.qr_code,
                    qrCodeText: existingPayment.qr_code_text,
                    expiresAt: existingPayment.expires_at,
                    externalReference: existingPayment.external_reference,
                    message: 'Pagamento já criado anteriormente'
                };
            }

            // ============================================
            // 3. CHAMAR MERCADO PAGO
            // ============================================
            const externalReference = `loterias-${data.productType}-${data.userId}-${Date.now()}`;
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

            const response = await fetch('https://api.mercadopago.com/v1/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.mercadopagoAccessToken}`,
                    'X-Idempotency-Key': data.idempotencyKey
                },
                body: JSON.stringify({
                    transaction_amount: amount,
                    description: description,
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
            });

            if (!response.ok) {
                const errorData = await response.text();
                return { success: false, error: `Erro no MP: ${response.status}` };
            }

            const paymentData = await response.json();

            // ============================================
            // 4. SALVAR NO BANCO
            // ============================================
            //await supabase
              //  .from('payments')
                //.insert({
                  //  user_id: data.userId,
                    //provider: 'mercadopago',
                    //provider_payment_id: String(paymentData.id),
                  //  status: 'pending',
               //     product_type: data.productType,
                 //   amount: amount,
                   // credits_amount: creditsToAdd,
                //    pix_qr_code: paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
               //     pix_copy_paste: paymentData.point_of_interaction?.transaction_data?.qr_code,
                 //   external_reference: externalReference,
                   // idempotency_key: data.idempotencyKey,
                   // payload: paymentData,
                   // expires_at: expiresAt.toISOString(),
                   // created_by_source: 'api'
              //  });
    
            return {
                success: true,
                paymentId: paymentData.id,
                qrCodeBase64: paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
                qrCodeText: paymentData.point_of_interaction?.transaction_data?.qr_code,
                expiresAt: expiresAt.toISOString(),
                externalReference: externalReference,
                amount: amount,
                creditsToAdd: creditsToAdd
            };
    
        } catch (error: any) {
            console.error('❌ Erro ao criar pagamento:', error);
            return { success: false, error: error.message };
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
            const { user_id, product_type, amount, payment_id, credits_amount } = payment;

            // ============================================
            // 1. BUSCAR USUÁRIO
            // ============================================
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('uid, is_pro, pro_expires_at, creditos, email')
                .eq('uid', user_id)
                .maybeSingle();

            if (error || !user) {
                return { success: false, error: 'Usuário não encontrado' };
            }

            // ============================================
            // 2. PROCESSAR POR TIPO
            // ============================================
            if (product_type === 'pro') {
                return await this.processarPro(user);
            } else if (product_type === 'credits') {
                return await this.processarCredits(user, credits_amount || amount);
            }

            return { success: false, error: `Tipo inválido: ${product_type}` };

        } catch (error: any) {
            console.error('❌ Erro ao processar pagamento:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // ATIVAR PRO
    // ============================================
    private async processarPro(user: any): Promise<{ success: boolean; error?: string }> {
        try {
            const newExpiresAt = ProService.calcularNovaExpiracao(user.pro_expires_at);
            const daysLeft = ProService.calcularDiasRestantes(newExpiresAt);

            await supabase
                .from('usuarios')
                .update({
                    is_pro: true,
                    pro_expires_at: newExpiresAt,
                    updated_at: new Date().toISOString()
                })
                .eq('uid', user.uid);

            await this.registrarTransacao({
                user_id: user.uid,
                type: 'pro_ativacao',
                amount: 0,
                description: `PRO ativado (${daysLeft} dias)`,
                metadata: { expires_at: newExpiresAt }
            });

            return { success: true };

        } catch (error: any) {
            return { success: false, error: error.message };
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
