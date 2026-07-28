// ============================================
// CAMINHO: services/PaymentService.ts
// ============================================
// SERVIÇO DE PAGAMENTOS - MERCADO PAGO
// ============================================

import { createClient } from '@supabase/supabase-js';
import { ProService } from './ProService.js';
import { CreditsService } from './CreditsService.js';
import { CONSTANTS } from '../core/config/constants.js';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PaymentData {
    userId: string;
    userEmail: string;
    userName: string;
    amount: number;
    type: 'pro' | 'credits';
    description: string;
}

interface PaymentResult {
    success: boolean;
    paymentId?: string;
    qrCodeBase64?: string;
    qrCodeText?: string;
    externalReference?: string;
    expiresAt?: string;
    paymentData?: any;
    error?: string;
}

interface WebhookValidation {
    valid: boolean;
    error?: string;
}

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
    async createPixPayment(data: PaymentData): Promise<PaymentResult> {
        try {
            const externalReference = `loterias-${data.type}-${data.userId}-${Date.now()}`;
            const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

            // ============================================
            // 1. CHAMAR MERCADO PAGO API
            // ============================================
            const response = await fetch('https://api.mercadopago.com/v1/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.mercadopagoAccessToken}`
                },
                body: JSON.stringify({
                    transaction_amount: data.amount,
                    description: data.description,
                    payment_method_id: 'pix',
                    payer: {
                        email: data.userEmail,
                        first_name: data.userName
                    },
                    external_reference: externalReference,
                    metadata: {
                        user_id: data.userId,
                        type: data.type
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('❌ Erro no Mercado Pago:', errorData);
                return {
                    success: false,
                    error: `Erro ao criar pagamento: ${response.status}`
                };
            }

            const paymentData = await response.json();

            // ============================================
            // 2. EXTRAIR QR CODE
            // ============================================
            const qrCodeBase64 = paymentData.point_of_interaction?.transaction_data?.qr_code_base64 || null;
            const qrCodeText = paymentData.point_of_interaction?.transaction_data?.qr_code || null;

            if (!qrCodeBase64 || !qrCodeText) {
                return {
                    success: false,
                    error: 'QR Code não gerado pelo Mercado Pago'
                };
            }

            return {
                success: true,
                paymentId: paymentData.id,
                qrCodeBase64,
                qrCodeText,
                externalReference,
                expiresAt: expiresAt.toISOString(),
                paymentData
            };

        } catch (error: any) {
            console.error('❌ Erro ao criar pagamento PIX:', error);
            return {
                success: false,
                error: error.message || 'Erro ao criar pagamento'
            };
        }
    }

    // ============================================
    // PROCESSAR PAGAMENTO CONFIRMADO
    // ============================================
    async processarPagamento(payment: any): Promise<{ success: boolean; error?: string }> {
        try {
            const { user_id, type, amount, payment_id } = payment;

            // ============================================
            // 1. VALIDAR VALOR
            // ============================================
            const valorEsperado = this.getValorEsperado(type);
            if (amount !== valorEsperado) {
                return {
                    success: false,
                    error: `Valor incorreto. Esperado: R$ ${valorEsperado}, Recebido: R$ ${amount}`
                };
            }

            // ============================================
            // 2. PROCESSAR POR TIPO
            // ============================================
            if (type === 'pro') {
                return await this.processarPro(user_id);
            } else if (type === 'credits') {
                return await this.processarCredits(user_id, amount);
            }

            return {
                success: false,
                error: `Tipo de pagamento inválido: ${type}`
            };

        } catch (error: any) {
            console.error('❌ Erro ao processar pagamento:', error);
            return {
                success: false,
                error: error.message || 'Erro ao processar pagamento'
            };
        }
    }

    // ============================================
    // PROCESSAR ASSINATURA PRO
    // ============================================
    private async processarPro(userId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // Buscar usuário
            const { data: user, error } = await supabase
                .from('usuarios')
                .select('uid, is_pro, pro_expires_at, creditos, email')
                .eq('uid', userId)
                .maybeSingle();

            if (error || !user) {
                return { success: false, error: 'Usuário não encontrado' };
            }

            // Calcular nova expiração (inteligente)
            const newExpiresAt = ProService.calcularNovaExpiracao(user.pro_expires_at);
            const daysLeft = ProService.calcularDiasRestantes(newExpiresAt);

            // Atualizar usuário
            await supabase
                .from('usuarios')
                .update({
                    is_pro: true,
                    pro_expires_at: newExpiresAt,
                    updated_at: new Date().toISOString()
                })
                .eq('uid', userId);

            // Registrar transação
            await this.registrarTransacao({
                user_id: userId,
                type: 'pro_ativacao',
                amount: 0,
                description: `Assinatura PRO ativada (${daysLeft} dias)`,
                metadata: { expires_at: newExpiresAt, days_left: daysLeft }
            });

            console.log(`✅ PRO ativado para ${userId}: ${daysLeft} dias`);

            return { success: true };

        } catch (error: any) {
            console.error('❌ Erro ao ativar PRO:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // PROCESSAR CRÉDITOS
    // ============================================
    private async processarCredits(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
        try {
            const creditsService = new CreditsService();
            const newBalance = await creditsService.addCredits(userId, amount);

            // Registrar transação
            await this.registrarTransacao({
                user_id: userId,
                type: 'compra_creditos',
                amount: amount,
                description: `Compra de ${amount} créditos`,
                metadata: { new_balance: newBalance }
            });

            console.log(`✅ ${amount} créditos adicionados para ${userId}`);

            return { success: true };

        } catch (error: any) {
            console.error('❌ Erro ao adicionar créditos:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // REGISTRAR TRANSAÇÃO
    // ============================================
    private async registrarTransacao(data: {
        user_id: string;
        type: string;
        amount: number;
        description: string;
        metadata?: any;
    }): Promise<void> {
        try {
            await supabase
                .from('transacoes')
                .insert({
                    usuario_uid: data.user_id,
                    tipo: data.type,
                    quantidade: data.amount,
                    saldo_apos: 0, // Será atualizado pelo service
                    referencia: data.description,
                    metadata: data.metadata || {},
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('❌ Erro ao registrar transação:', error);
            // Não falha o processo
        }
    }

    // ============================================
    // VALIDAR WEBHOOK
    // ============================================
    validarWebhook(signature: string | null, body: any): boolean {
        if (!signature) {
            console.warn('⚠️ Assinatura do webhook não fornecida');
            return false;
        }

        // Simples validação (aprimorar com a assinatura real do Mercado Pago)
        // Na produção, use a biblioteca oficial do Mercado Pago para validar
        if (this.mercadopagoWebhookSecret && signature !== this.mercadopagoWebhookSecret) {
            console.warn('⚠️ Assinatura do webhook inválida');
            return false;
        }

        return true;
    }

    // ============================================
    // VALOR ESPERADO POR TIPO
    // ============================================
    private getValorEsperado(type: string): number {
        const valores = {
            'pro': 20,      // Assinatura PRO (R$ 20,00)
            'credits_12': 12,
            'credits_24': 24,
            'credits_36': 36,
            'credits_48': 48,
            'credits_60': 60,
            'credits_120': 120,
            'credits_180': 180,
            'credits_240': 240
        };
        return (valores as any)[type] || 0;
    }
}
