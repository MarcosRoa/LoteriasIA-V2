// app/(tabs)/profile.tsx 24/06/2026
// app/(tabs)/profile.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../src/stores/authStore';
import { useSessionStore } from '../../src/stores/sessionStore'; // ✅ ADICIONAR
import { getCredits, getProStatus, createPayment } from '../../src/services/api';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const { openLoginModal } = useSessionStore(); // ✅ ADICIONAR
    const [credits, setCredits] = useState(0);
    const [isPro, setIsPro] = useState(false);
    const [proDaysLeft, setProDaysLeft] = useState(0);
    const [loading, setLoading] = useState(true);

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
        } catch (error: any) {
            console.error('❌ Erro ao carregar dados:', error);
            setCredits(0);
            setIsPro(false);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [user])
    );

    const handleBuyCredits = () => {
        Alert.alert(
            'Comprar Créditos',
            'Escolha o valor',
            [
                { text: 'R$ 12', onPress: () => processPayment(12) },
                { text: 'R$ 24', onPress: () => processPayment(24) },
                { text: 'R$ 50', onPress: () => processPayment(50) },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const processPayment = async (amount: number) => {
        try {
            const result = await createPayment(amount);
            if (result?.mode === 'simulation') {
                Alert.alert('Simulação', `R$ ${amount} adicionados (modo demonstração)`);
                loadUserData();
            } else if (result?.paymentLink) {
                Alert.alert('Pagamento', `Abra o link para pagar: ${result.paymentLink}`);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível processar o pagamento');
        }
    };

    // ✅ LOGOUT CORRIGIDO
    const handleLogout = () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Sair', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        openLoginModal(); // ✅ ABRIR MODAL DE LOGIN
                    }
                }
            ]
        );
    };

    const handleActivatePro = () => {
        Alert.alert('Em breve', 'Plano PRO será disponibilizado em breve');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    const avatarLetter = user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U';

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatarLetter}</Text>
                </View>
                <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0] || 'Usuário'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {isPro && <View style={styles.proBadge}><Text style={styles.proText}>⭐ PRO</Text></View>}
                {isPro && proDaysLeft > 0 && (
                    <Text style={styles.proExpires}>✨ Válido por mais {proDaysLeft} dias</Text>
                )}
            </View>

            <View style={styles.creditsCard}>
                <Text style={styles.creditsLabel}>💰 SALDO</Text>
                <Text style={styles.creditsValue}>R$ {credits}</Text>
                <TouchableOpacity style={styles.buyButton} onPress={handleBuyCredits}>
                    <Text style={styles.buyButtonText}>➕ Comprar Créditos</Text>
                </TouchableOpacity>
            </View>

            {!isPro && (
                <TouchableOpacity style={styles.proButton} onPress={handleActivatePro}>
                    <Text style={styles.proButtonText}>⭐ ATIVAR PLANO PRO</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>🚪 Sair da conta</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Versão 1.0.0</Text>
        </ScrollView>
    );
}

// ... styles iguais aos que já existem
