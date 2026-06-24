// mobile/app/(tabs)/generate.tsx
// app/(tabs)/generate.tsx 24/06/2024
// app/(tabs)/generate.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LOTTERIES } from '../../src/constants/lotteries';
import { generateGames, getCredits } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { NumberBall } from '../../src/components/NumberBall';
import IATraining from '../../src/components/IATraining';

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
    const [dispersao, setDispersao] = useState(15); // ✅ NOVO: dispersão
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
    const [creditsRemaining, setCreditsRemaining] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const [isTraining, setIsTraining] = useState(false);
    const [isTrained, setIsTrained] = useState(false);
    const [iaConfidence, setIaConfidence] = useState(0);
    const [totalDataPoints, setTotalDataPoints] = useState(0);

    const COST_PER_GAME = 3;
    const totalCost = quantity * COST_PER_GAME;

    const loadCredits = async () => {
        if (!user) return;
        try {
            const data = await getCredits();
            setCreditsRemaining(data?.credits || 0);
        } catch (error) {
            console.error('❌ Erro ao carregar créditos:', error);
            setCreditsRemaining(0);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCredits();
        }, [user])
    );

    const trainIA = async () => {
        setIsTraining(true);
        setIsTrained(false);
        
        setTimeout(() => {
            setIsTraining(false);
            setIsTrained(true);
            setIaConfidence(85);
            setTotalDataPoints(156);
        }, 2500);
    };

    useEffect(() => {
        trainIA();
    }, [selectedPeriod, mode, dispersao]); // ✅ Adicionado dispersao

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
                period: selectedPeriod, // ✅ ENVIANDO PERÍODO
                dispersao: dispersao,   // ✅ ENVIANDO DISPERSÃO
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
            <View style={styles.header}>
                <Text style={styles.lotteryIcon}>{lottery.icone}</Text>
                <Text style={styles.lotteryName}>{lottery.nome}</Text>
                <Text style={styles.lotteryRange}>{lottery.numeros} números • 1 a {lottery.maxNumero}</Text>
            </View>

            {/* Período */}
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

            {/* ✅ DISPERSÃO - NOVO */}
            <View style={styles.card}>
                <Text style={styles.label}>🎯 Dispersão</Text>
                <Text style={styles.dispersaoLabel}>
                    Bloquear números dos últimos {dispersao} concursos
                </Text>
                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderMin}>5</Text>
                    <View style={styles.sliderTrack}>
                        <View style={[styles.sliderFill, { width: `${((dispersao - 5) / 20) * 100}%` }]} />
                    </View>
                    <Text style={styles.sliderMax}>25</Text>
                </View>
                <View style={styles.dispersaoButtons}>
                    {[5, 10, 15, 20, 25].map((value) => (
                        <TouchableOpacity
                            key={value}
                            style={[
                                styles.dispersaoButton,
                                dispersao === value && styles.dispersaoButtonActive
                            ]}
                            onPress={() => setDispersao(value)}
                        >
                            <Text style={[
                                styles.dispersaoButtonText,
                                dispersao === value && styles.dispersaoButtonTextActive
                            ]}>
                                {value}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Treinamento IA */}
            <IATraining 
                isTraining={isTraining}
                isTrained={isTrained}
                confidence={iaConfidence}
                totalDataPoints={totalDataPoints}
                selectedPeriod={selectedPeriod.toString()}
                selectedMode={mode}
                lotteryId={lottery.id}
            />

            {/* Créditos */}
            <View style={styles.creditsCard}>
                <View style={styles.creditsRow}>
                    <Text style={styles.creditsLabel}>💰 Seus Créditos</Text>
                    <Text style={styles.creditsValue}>{creditsRemaining}</Text>
                </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>💳 SALDO ATUAL</Text>
                    <Text style={styles.infoValue}>{creditsRemaining} créditos</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>🎲 CUSTO DA GERAÇÃO</Text>
                    <Text style={styles.infoValue}>{totalCost} créditos</Text>
                </View>
                {dispersao > 0 && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>🎯 DISPERSÃO</Text>
                        <Text style={styles.infoValue}>{dispersao} concursos</Text>
                    </View>
                )}
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
                <Text style={styles.quantityHint}>Cada jogo custa 3 créditos</Text>
            </View>

            {/* Modos IA */}
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

            {errorMessage && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorText}>❌ {errorMessage}</Text>
                </View>
            )}

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
        marginBottom: 20,
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
    // ✅ DISPERSÃO
    dispersaoLabel: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    sliderMin: {
        color: '#64748b',
        fontSize: 12,
    },
    sliderMax: {
        color: '#64748b',
        fontSize: 12,
    },
    sliderTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#8b5cf6',
        borderRadius: 3,
    },
    dispersaoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    dispersaoButton: {
        flex: 1,
        backgroundColor: '#334155',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    dispersaoButtonActive: {
        backgroundColor: '#8b5cf6',
    },
    dispersaoButtonText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '600',
    },
    dispersaoButtonTextActive: {
        color: '#ffffff',
    },
    creditsCard: {
        backgroundColor: '#f59e0b',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    creditsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 8,
    },
    creditsLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    creditsValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    infoCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#334155',
        marginVertical: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 8,
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
    quantityHint: {
        fontSize: 12,
        color: '#64748b',
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
