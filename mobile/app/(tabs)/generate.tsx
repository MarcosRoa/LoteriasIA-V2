// mobile/app/(tabs)/generate.tsx
// app/(tabs)/generate.tsx 14/06/2024
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LOTTERIES } from '../../src/constants/lotteries';
import { generateGames } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { NumberBall } from '../../src/components/NumberBall';

const PERIODS = [
    { value: 'all', label: 'Todos' },
    { value: 1, label: '1 Ano' },
    { value: 3, label: '3 Anos' },
    { value: 5, label: '5 Anos' },
    { value: 7, label: '7 Anos' },
    { value: 9, label: '9 Anos' },
];

const IA_MODES = [
    { id: 'ia_especialista', label: '🎓 IA Especialista', description: 'Algoritmo avançado com análise de padrões' },
    { id: 'aleatorio_inteligente', label: '🎲 Aleatório Inteligente', description: 'Aleatório com ponderação estatística' },
    { id: 'probabilistico', label: '📊 Probabilístico', description: 'Baseado em frequência e probabilidades' },
    { id: 'aleatorio_puro', label: '🎯 Aleatório Puro', description: 'RNG total - sorte pura' },
];

export default function GenerateScreen() {
    const router = useRouter();
    const { lottery: lotteryParam } = useLocalSearchParams();
    const { user } = useAuthStore();
    
    const lottery = LOTTERIES.find(l => l.id === lotteryParam) || LOTTERIES[0];
    const [quantity, setQuantity] = useState(1);
    const [mode, setMode] = useState('ia_especialista');
    const [selectedPeriod, setSelectedPeriod] = useState<string | number>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
    const [creditsRemaining, setCreditsRemaining] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const COST_PER_GAME = 3;
    const totalCost = quantity * COST_PER_GAME;

    const handleGenerate = async () => {
        setErrorMessage(null);
        
        if (!user) {
            Alert.alert('Erro', 'Faça login para gerar jogos');
            return;
        }

        setIsGenerating(true);
        setGeneratedGames([]);

        try {
            const result = await generateGames({
                lottery: lottery.id,
                quantity: quantity,
                mode: mode,
                extraNumbers: lottery.numeros,
            });

            setGeneratedGames(result.games || []);
            setCreditsRemaining(result.creditsRemaining);
            
            Alert.alert('Sucesso!', `${quantity} jogo(s) gerado(s)! Custo: ${totalCost} créditos`);
        } catch (error: any) {
            console.error('Erro ao gerar:', error);
            const msg = error.response?.data?.error || error.message || 'Erro ao gerar jogos';
            setErrorMessage(msg);
            Alert.alert('Erro', msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const increaseQuantity = () => {
        if (quantity < 20) setQuantity(quantity + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.lotteryIcon}>{lottery.icone}</Text>
                <Text style={styles.lotteryName}>{lottery.nome}</Text>
                <Text style={styles.lotteryRange}>{lottery.numeros} números • 1 a {lottery.maxNumero}</Text>
            </View>

            {/* Período Selector */}
            <View style={styles.card}>
                <Text style={styles.label}>📅 Período de Análise</Text>
                <View style={styles.periodContainer}>
                    {PERIODS.map((period) => (
                        <TouchableOpacity
                            key={period.value.toString()}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period.value && styles.periodButtonActive
                            ]}
                            onPress={() => setSelectedPeriod(period.value)}
                        >
                            <Text style={[
                                styles.periodButtonText,
                                selectedPeriod === period.value && styles.periodButtonTextActive
                            ]}>
                                {period.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Créditos */}
            <View style={styles.creditsCard}>
                <Text style={styles.creditsLabel}>💰 SEUS CRÉDITOS</Text>
                <Text style={styles.creditsValue}>{creditsRemaining}</Text>
                <Text style={styles.costInfo}>Custo: {totalCost} créditos ({quantity} jogo(s) x 3 créditos)</Text>
            </View>

            {/* Quantidade */}
            <View style={styles.card}>
                <Text style={styles.label}>📊 Quantidade de Jogos</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modos de IA - 4 opções */}
            <View style={styles.card}>
                <Text style={styles.label}>🎓 Modo de IA</Text>
                <View style={styles.modesGrid}>
                    {IA_MODES.map((iaMode) => (
                        <TouchableOpacity 
                            key={iaMode.id}
                            style={[
                                styles.modeButton, 
                                mode === iaMode.id && styles.modeActive
                            ]}
                            onPress={() => setMode(iaMode.id)}
                        >
                            <Text style={styles.modeText}>{iaMode.label}</Text>
                            <Text style={styles.modeDescription}>{iaMode.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Gerar Button */}
            <TouchableOpacity 
                style={[styles.generateButton, isGenerating && styles.disabledButton]}
                onPress={handleGenerate}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.generateButtonText}>🎲 GERAR {quantity} JOGO(S)</Text>
                )}
            </TouchableOpacity>

            {/* Error Message */}
            {errorMessage && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorText}>❌ {errorMessage}</Text>
                </View>
            )}

            {/* Results */}
            {generatedGames.length > 0 && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>🎯 RESULTADO</Text>
                    {generatedGames.map((game, idx) => (
                        <View key={idx} style={styles.gameContainer}>
                            <Text style={styles.gameTitle}>Jogo {idx + 1}</Text>
                            <View style={styles.ballsContainer}>
                                {game.map((num, numIdx) => (
                                    <NumberBall key={numIdx} number={num} color={lottery.cor} />
                                ))}
                            </View>
                        </View>
                    ))}
                    <Text style={styles.creditsRemainingText}>💰 Créditos restantes: {creditsRemaining}</Text>
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
    header: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#1e293b',
        borderRadius: 16,
    },
    lotteryIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    lotteryName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    lotteryRange: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    card: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 12,
    },
    periodContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    periodButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#8b5cf6',
    },
    periodButtonText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    periodButtonTextActive: {
        color: '#ffffff',
    },
    creditsCard: {
        backgroundColor: '#f59e0b',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    creditsLabel: {
        fontSize: 12,
        color: '#1e293b',
        fontWeight: '600',
    },
    creditsValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    costInfo: {
        fontSize: 12,
        color: '#1e293b',
        marginTop: 4,
        opacity: 0.8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    quantityButton: {
        width: 44,
        height: 44,
        backgroundColor: '#334155',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    quantityValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f59e0b',
        minWidth: 50,
        textAlign: 'center',
    },
    modesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    modeButton: {
        flex: 1,
        minWidth: '45%',
        padding: 12,
        backgroundColor: '#334155',
        borderRadius: 12,
        alignItems: 'center',
    },
    modeActive: {
        backgroundColor: '#8b5cf6',
    },
    modeText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 13,
        marginBottom: 4,
    },
    modeDescription: {
        color: '#94a3b8',
        fontSize: 10,
        textAlign: 'center',
    },
    generateButton: {
        backgroundColor: '#22c55e',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    disabledButton: {
        opacity: 0.6,
    },
    generateButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorCard: {
        backgroundColor: '#7f1d1d',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#fca5a5',
        fontSize: 14,
        textAlign: 'center',
    },
    resultCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f59e0b',
        marginBottom: 16,
        textAlign: 'center',
    },
    gameContainer: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#0f172a',
        borderRadius: 12,
    },
    gameTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#38bdf8',
        marginBottom: 8,
    },
    ballsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    creditsRemainingText: {
        fontSize: 14,
        color: '#f59e0b',
        textAlign: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
});
