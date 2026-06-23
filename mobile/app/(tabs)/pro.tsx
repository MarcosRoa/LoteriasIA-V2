// app/(tabs)/pro.tsx 26/06/2026
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { getCredits, getProStatus } from '../../src/services/api';

const PRO_PLANS = [
    {
        id: 'mensal',
        name: 'Mensal',
        price: 'R$ 29,90',
        period: '30 dias',
        features: [
            'Jogos por apenas 2 créditos',
            'Modo Bolão exclusivo',
            'Estatísticas avançadas',
            'PDF dos jogos',
            'Suporte prioritário',
        ],
    },
    {
        id: 'trimestral',
        name: 'Trimestral',
        price: 'R$ 69,90',
        period: '90 dias',
        features: [
            'Jogos por apenas 2 créditos',
            'Modo Bolão exclusivo',
            'Estatísticas avançadas',
            'PDF dos jogos',
            'Suporte prioritário',
            'Economia de 22%',
        ],
        popular: true,
    },
    {
        id: 'anual',
        name: 'Anual',
        price: 'R$ 199,90',
        period: '365 dias',
        features: [
            'Jogos por apenas 2 créditos',
            'Modo Bolão exclusivo',
            'Estatísticas avançadas',
            'PDF dos jogos',
            'Suporte prioritário',
            'Economia de 44%',
            'Acesso a sorteios exclusivos',
        ],
    },
];

export default function ProScreen() {
    const { user } = useAuthStore();
    const [credits, setCredits] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [proDaysLeft, setProDaysLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState('trimestral');

    const loadUserData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const creditsData = await getCredits();
            setCredits(creditsData?.credits || 0);
            setIsPro(creditsData?.isPro || false);
            
            const proData = await getProStatus();
            setProDaysLeft(proData?.daysLeft || 0);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [user])
    );

    const handleSubscribe = (plan: typeof PRO_PLANS[0]) => {
        Alert.alert(
            `⭐ Plano ${plan.name}`,
            `Deseja assinar o plano ${plan.name} por ${plan.price}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Assinar', 
                    onPress: () => {
                        Alert.alert('Simulação', `Plano ${plan.name} ativado! (modo demonstração)`);
                        loadUserData();
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⭐ Plano PRO</Text>
                <Text style={styles.headerSubtitle}>
                    Desbloqueie todo o potencial da IA
                </Text>
            </View>

            {/* Status do usuário */}
            <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>📊 Seu plano:</Text>
                    <Text style={[styles.statusValue, isPro && styles.statusPro]}>
                        {isPro ? '⭐ PRO' : 'Free'}
                    </Text>
                </View>
                {isPro && proDaysLeft > 0 && (
                    <Text style={styles.statusDays}>
                        ⏳ Válido por mais {proDaysLeft} dias
                    </Text>
                )}
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>💰 Créditos:</Text>
                    <Text style={styles.statusValue}>{credits}</Text>
                </View>
            </View>

            {/* Benefícios PRO */}
            {!isPro && (
                <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>🚀 Benefícios PRO</Text>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Jogos por apenas 2 créditos (33% OFF)</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Modo Bolão: até 20 números por jogo</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Estatísticas avançadas</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Baixar jogos em PDF</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.benefitText}>Suporte prioritário</Text>
                    </View>
                </View>
            )}

            {/* Planos */}
            {!isPro && (
                <View style={styles.plansContainer}>
                    <Text style={styles.plansTitle}>📋 Escolha seu plano</Text>
                    
                    {PRO_PLANS.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                selectedPlan === plan.id && styles.planCardSelected,
                                plan.popular && styles.planCardPopular,
                            ]}
                            onPress={() => setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
                                </View>
                            )}
                            
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>{plan.name}</Text>
                                <Text style={styles.planPrice}>{plan.price}</Text>
                            </View>
                            
                            <Text style={styles.planPeriod}>{plan.period}</Text>
                            
                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.planFeature}>
                                    <Text style={styles.planFeatureBullet}>•</Text>
                                    <Text style={styles.planFeatureText}>{feature}</Text>
                                </View>
                            ))}
                            
                            <TouchableOpacity
                                style={[
                                    styles.subscribeButton,
                                    selectedPlan === plan.id && styles.subscribeButtonActive,
                                ]}
                                onPress={() => handleSubscribe(plan)}
                            >
                                <Text style={styles.subscribeButtonText}>
                                    Assinar {plan.name}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Se já é PRO */}
            {isPro && (
                <View style={styles.alreadyProCard}>
                    <Text style={styles.alreadyProText}>⭐ Você já é PRO!</Text>
                    <Text style={styles.alreadyProSubtext}>
                        Aproveite todos os benefícios exclusivos.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#1e293b',
        borderRadius: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    statusCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    statusLabel: {
        fontSize: 14,
        color: '#94a3b8',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    statusPro: {
        color: '#f59e0b',
    },
    statusDays: {
        fontSize: 12,
        color: '#f59e0b',
        textAlign: 'center',
        marginTop: 8,
    },
    benefitsCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    benefitsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    benefitText: {
        fontSize: 14,
        color: '#94a3b8',
    },
    plansContainer: {
        marginBottom: 24,
    },
    plansTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    planCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    planCardSelected: {
        borderColor: '#8b5cf6',
    },
    planCardPopular: {
        borderColor: '#f59e0b',
    },
    popularBadge: {
        backgroundColor: '#f59e0b',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
    },
    popularBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    planPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    planPeriod: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 12,
    },
    planFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    planFeatureBullet: {
        color: '#8b5cf6',
        fontSize: 14,
    },
    planFeatureText: {
        fontSize: 13,
        color: '#94a3b8',
    },
    subscribeButton: {
        backgroundColor: '#334155',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    subscribeButtonActive: {
        backgroundColor: '#8b5cf6',
    },
    subscribeButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    alreadyProCard: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    alreadyProText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    alreadyProSubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
    },
});
