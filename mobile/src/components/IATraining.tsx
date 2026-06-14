// src/components/IATraining.tsx
// src/components/IATraining.tsx - VERSÃO CORRIGIDA
// src/components/IATraining.tsx - VERSÃO COM TREINAMENTO AUTOMÁTICO
// mobile/src/components/IATraining.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface IATrainingProps {
    lotteryId: string;
    selectedPeriod?: string | number;
    selectedMode?: string;
    onTrainingComplete?: (confidence: number) => void;
}

export default function IATraining({ 
    lotteryId, 
    selectedPeriod = 'all', 
    selectedMode = 'ia_especialista',
    onTrainingComplete 
}: IATrainingProps) {
    const [isTraining, setIsTraining] = useState(false);
    const [isTrained, setIsTrained] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [totalDataPoints, setTotalDataPoints] = useState(0);
    
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Treinar automaticamente quando período ou modo mudar
    useEffect(() => {
        trainIA();
    }, [selectedPeriod, selectedMode, lotteryId]);

    const startTrainingAnimation = () => {
        setIsTraining(true);
        setIsTrained(false);
        
        progressAnim.setValue(0);
        pulseAnim.setValue(1);
        
        // Animação de pulso
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
        
        // Animar barra de progresso
        Animated.timing(progressAnim, {
            toValue: 100,
            duration: 2000,
            useNativeDriver: false,
        }).start();
    };

    const getProgressColor = () => {
        if (confidence >= 80) return '#22c55e';
        if (confidence >= 50) return '#f59e0b';
        if (confidence >= 25) return '#eab308';
        return '#ef4444';
    };

    const trainIA = async () => {
        startTrainingAnimation();
        
        // Simular treinamento (API será chamada depois)
        setTimeout(() => {
            const mockConfidence = 85;
            const mockDataPoints = 156;
            setConfidence(mockConfidence);
            setTotalDataPoints(mockDataPoints);
            setIsTrained(true);
            setIsTraining(false);
            onTrainingComplete?.(mockConfidence);
            pulseAnim.stopAnimation();
        }, 2000);
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%']
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🧠 Treinamento da IA</Text>
            
            <View style={styles.animationContainer}>
                <View style={styles.progressBarContainer}>
                    <Animated.View 
                        style={[
                            styles.progressBar,
                            { width: progressWidth, backgroundColor: getProgressColor() }
                        ]} 
                    />
                </View>
                
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    {isTraining ? (
                        <View style={styles.trainingTextContainer}>
                            <Text style={styles.trainingEmoji}>🧠</Text>
                            <Text style={styles.trainingText}>INTELIGÊNCIA ARTIFICIAL EM TREINAMENTO...</Text>
                            <Text style={styles.trainingSubtext}>
                                Analisando {selectedPeriod === 'all' ? 'todos os concursos' : `${selectedPeriod} ano(s)`} • Modo: {selectedMode.replace('_', ' ')}
                            </Text>
                        </View>
                    ) : isTrained ? (
                        <View style={styles.trainedTextContainer}>
                            <Text style={styles.trainedEmoji}>✅</Text>
                            <Text style={styles.trainedText}>INTELIGÊNCIA ARTIFICIAL TREINADA!</Text>
                            <Text style={styles.trainedSubtext}>
                                Confiança: {confidence}% • {totalDataPoints} concursos analisados
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.waitingContainer}>
                            <Text style={styles.waitingText}>⏳ Aguardando configurações...</Text>
                        </View>
                    )}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    animationContainer: {
        marginTop: 8,
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: '#334155',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
    trainingTextContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
    },
    trainingText: {
        color: '#f59e0b',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },
    trainingSubtext: {
        color: '#94a3b8',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
    },
    trainingEmoji: {
        fontSize: 32,
    },
    trainedTextContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    trainedText: {
        color: '#22c55e',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },
    trainedSubtext: {
        color: '#94a3b8',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
    },
    trainedEmoji: {
        fontSize: 32,
    },
    waitingContainer: {
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        borderRadius: 12,
    },
    waitingText: {
        color: '#94a3b8',
        fontSize: 12,
        textAlign: 'center',
    },
});
