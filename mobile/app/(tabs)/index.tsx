// app/(tabs)/index.tsx 15/06/2026
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LOTTERIES } from '../../src/constants/lotteries';
import { useAuthStore } from '../../src/stores/authStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { getCredits } from '../../src/services/api';

export default function HomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { openLoginModal } = useSessionStore();
    const [credits, setCredits] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadUserData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        try {
            const data = await getCredits();
            setCredits(data.credits || 0);
            setIsPro(data.isPro || false);
        } catch (error) {
            console.error('Erro ao carregar créditos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Recarregar dados quando a tela ganhar foco
    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [user])
    );

    const handleSelectLottery = (lotteryId: string) => {
        router.push({
            pathname: '/(tabs)/generate',
            params: { lottery: lotteryId }
        });
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Sair', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        openLoginModal();
                    }
                }
            ]
        );
    };

    const handleActivatePro = () => {
        if (!user) {
            Alert.alert('Faça login', 'Você precisa estar logado para ativar o plano PRO');
            openLoginModal();
            return;
        }
        
        Alert.alert(
            '⭐ Plano PRO',
            'Benefícios do plano PRO:\n\n• Jogos por apenas 2 créditos\n• Modo Bolão exclusivo\n• Estatísticas avançadas\n• Suporte prioritário\n\nEm breve disponível!',
            [{ text: 'Entendi', style: 'default' }]
        );
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Logo e cabeçalho */}
                <View style={styles.header}>
                    <Image 
                        source={require('../../assets/images/logo2.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.subtitle}>
                        Inteligência Artificial para Loterias
                    </Text>
                    <Text style={styles.subtitle2}>
                        IA que Aprende Padrões
                    </Text>
                </View>

                {/* Saudação personalizada */}
                <Text style={styles.greeting}>
                    {getGreeting()}, {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Visitante'}!
                </Text>

                {/* Cards de créditos e PRO */}
                <View style={styles.statsContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardValue}>{credits}</Text>
                        <Text style={styles.cardLabel}>Créditos</Text>
                    </View>
                    <View style={[styles.card, isPro && styles.proCard]}>
                        <Text style={styles.cardValue}>{isPro ? '⭐ PRO' : 'Free'}</Text>
                        <Text style={styles.cardLabel}>Plano</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>
                    Escolha sua loteria
                </Text>

                {/* Grid de loterias */}
                <View style={styles.grid}>
                    {LOTTERIES.map((lottery) => (
                        <TouchableOpacity
                            key={lottery.id}
                            style={[styles.lotteryCard, { borderColor: lottery.cor }]}
                            onPress={() => handleSelectLottery(lottery.id)}
                        >
                            <Text style={styles.icon}>{lottery.icone}</Text>
                            <Text style={styles.lotteryName}>{lottery.nome}</Text>
                            <Text style={styles.rules}>
                                {lottery.numeros} números • 1 a {lottery.maxNumero}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Botões SAIR e ATIVAR PRO lado a lado */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Sair</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.proButton]}
                        onPress={handleActivatePro}
                    >
                        <Ionicons name="star-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Ativar PRO</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    header: {
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 0,
    },
    logo: {
        width: 450,
        height: 300,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
    },
    subtitle2: {
        marginTop: 2,
        fontSize: 13,
        color: '#8b5cf6',
        fontWeight: '600',
        textAlign: 'center',
    },
    greeting: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 16,
        marginTop: 10,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    card: {
        flex: 1,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
    },
    proCard: {
        backgroundColor: '#8b5cf6',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    cardLabel: {
        marginTop: 4,
        color: '#94a3b8',
        fontSize: 12,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
    },
    lotteryCard: {
        width: '45%',
        margin: '2.5%',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    icon: {
        fontSize: 32,
        marginBottom: 8,
    },
    lotteryName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    rules: {
        color: '#94a3b8',
        fontSize: 10,
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 24,
        marginHorizontal: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 30,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
    },
    proButton: {
        backgroundColor: '#8b5cf6',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});
