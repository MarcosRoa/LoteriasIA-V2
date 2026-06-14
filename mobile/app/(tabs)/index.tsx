import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LOTTERIES } from '../../src/constants/lotteries';
import { useAuthStore } from '../../src/stores/authStore';
import { getCredits } from '../../src/services/api';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [credits, setCredits] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadUserData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadUserData = async () => {
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

    const handleSelectLottery = (lotteryId: string) => {
        router.push({
            pathname: '/(tabs)/generate',
            params: { lottery: lotteryId }
        });
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
});