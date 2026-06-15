// src/components/IATraining.tsx
// src/components/IATraining.tsx - VERSÃO CORRIGIDA
// src/components/IATraining.tsx - VERSÃO COM TREINAMENTO AUTOMÁTICO
// mobile/src/components/IATraining.tsx
// src/components/IATraining.tsx 15/06/2026
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';

interface IATrainingProps {
  isTraining: boolean;
  isTrained: boolean;
  confidence: number;
  totalDataPoints: number;
  selectedPeriod: string;
  selectedMode: string;
}

export default function IATraining({ 
  isTraining, 
  isTrained, 
  confidence, 
  totalDataPoints, 
  selectedPeriod, 
  selectedMode 
}: IATrainingProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isTraining) {
      startTrainingAnimation();
    } else if (isTrained) {
      finishTrainingAnimation();
    }
  }, [isTraining, isTrained]);

  const startTrainingAnimation = () => {
    // Reset progress
    progressAnim.setValue(0);
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Animate progress bar to 100% over 2 seconds
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  };

  const finishTrainingAnimation = () => {
    // Ensure progress reaches 100%
    progressAnim.setValue(100);
    // Stop pulse animation
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const getProgressColor = () => {
    const progress = progressAnim;
    // Interpolate color based on progress value
    if (confidence >= 80) return '#22c55e'; // Verde
    if (confidence >= 50) return '#f59e0b'; // Laranja
    if (confidence >= 25) return '#eab308'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  const getPeriodText = () => {
    if (selectedPeriod === 'all') return 'todos os concursos';
    return `${selectedPeriod} ano(s)`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Treinamento da Inteligência Artificial</Text>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: progressWidth, backgroundColor: getProgressColor() }
          ]} 
        />
      </View>
      
      {/* Status Area */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        {isTraining ? (
          <View style={styles.trainingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.trainingTitle}>🧠 INTELIGÊNCIA ARTIFICIAL EM TREINAMENTO...</Text>
            <Text style={styles.trainingSubtext}>
              Analisando {getPeriodText()} • Modo: {selectedMode.replace(/_/g, ' ')}
            </Text>
          </View>
        ) : isTrained ? (
          <View style={styles.trainedContainer}>
            <Text style={styles.trainedEmoji}>✅</Text>
            <Text style={styles.trainedTitle}>INTELIGÊNCIA ARTIFICIAL TREINADA!</Text>
            <Text style={styles.trainedSubtext}>
              Confiança: {confidence}% • {totalDataPoints} concursos analisados
            </Text>
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>⏳ Aguardando configurações para treinar...</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// Substitua os estilos do container principal

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 12,  // ← Reduzido de 16 para 12 (20% menor)
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 8,  // ← Reduzido
    },
    progressBarContainer: {
        height: 8,  // ← Barra mais fina
        backgroundColor: '#334155',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,  // ← Reduzido
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    trainingContainer: {
        alignItems: 'center',
        padding: 12,  // ← Reduzido
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
        gap: 8,
    },
    trainingTitle: {
        color: '#f59e0b',
        fontSize: 13,  // ← Reduzido
        fontWeight: 'bold',
        textAlign: 'center',
    },
    trainingSubtext: {
        color: '#94a3b8',
        fontSize: 10,  // ← Reduzido
        textAlign: 'center',
    },
    trainedContainer: {
        alignItems: 'center',
        padding: 12,  // ← Reduzido
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#22c55e',
        gap: 6,
    },
    trainedEmoji: {
        fontSize: 28,  // ← Reduzido
    },
    trainedTitle: {
        color: '#22c55e',
        fontSize: 13,  // ← Reduzido
        fontWeight: 'bold',
        textAlign: 'center',
    },
    trainedSubtext: {
        color: '#94a3b8',
        fontSize: 10,  // ← Reduzido
        textAlign: 'center',
    },
    waitingContainer: {
        alignItems: 'center',
        padding: 12,  // ← Reduzido
        backgroundColor: 'rgba(100, 116, 139, 0.1)',
        borderRadius: 12,
    },
    waitingText: {
        color: '#94a3b8',
        fontSize: 11,  // ← Reduzido
        textAlign: 'center',
    },
});
