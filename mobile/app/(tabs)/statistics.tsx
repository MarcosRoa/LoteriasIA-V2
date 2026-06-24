// app/(tabs)/statistics.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../src/stores/authStore';
import { getCredits, getProStatus } from '../../src/services/api';
import StatisticsCard from '../../src/components/StatisticsCard';

const LOTTERIES = [
  { id: 'megasena', nome: 'Mega-Sena', icone: '💰' },
  { id: 'quina', nome: 'Quina', icone: '🎯' },
  { id: 'lotofacil', nome: 'Lotofácil', icone: '🍀' },
  { id: 'lotomania', nome: 'Lotomania', icone: '🎪' },
  { id: 'duplasena', nome: 'Dupla Sena', icone: '🎲' },
  { id: 'timemania', nome: 'Timemania', icone: '⚽' },
  { id: 'milionaria', nome: '+Milionária', icone: '💎' },
  { id: 'loteca', nome: 'Loteca', icone: '⚽' },
  { id: 'diadesorte', nome: 'Dia de Sorte', icone: '📅' },
  { id: 'supersete', nome: 'Super Sete', icone: '🌟' },
];

const PERIODS = [
  { value: 'all', label: 'Todos' },
  { value: 1, label: '1 Ano' },
  { value: 3, label: '3 Anos' },
  { value: 5, label: '5 Anos' },
  { value: 7, label: '7 Anos' },
  { value: 9, label: '9 Anos' },
];

// Dados mockados para simular o que viria da API
const MOCK_STATISTICS = {
  megasena: {
    maisSorteados: [
      { label: '10', value: '42 vezes' },
      { label: '23', value: '38 vezes' },
      { label: '45', value: '36 vezes' },
      { label: '12', value: '34 vezes' },
      { label: '33', value: '33 vezes' },
    ],
    menosSorteados: [
      { label: '55', value: '8 vezes' },
      { label: '58', value: '9 vezes' },
      { label: '60', value: '10 vezes' },
      { label: '02', value: '11 vezes' },
      { label: '17', value: '12 vezes' },
    ],
    duplas: [
      { label: '(10, 23)', value: '12 vezes' },
      { label: '(23, 45)', value: '10 vezes' },
      { label: '(10, 45)', value: '9 vezes' },
    ],
    triplas: [
      { label: '(10, 23, 45)', value: '5 vezes' },
      { label: '(12, 23, 33)', value: '4 vezes' },
    ],
  },
  timemania: {
    maisSorteados: [
      { label: '12', value: '45 vezes' },
      { label: '34', value: '42 vezes' },
      { label: '56', value: '39 vezes' },
    ],
    menosSorteados: [
      { label: '78', value: '10 vezes' },
      { label: '80', value: '11 vezes' },
    ],
    duplas: [
      { label: '(12, 34)', value: '15 vezes' },
    ],
    triplas: [
      { label: '(12, 34, 56)', value: '6 vezes' },
    ],
    times: [
      { label: 'Corinthians', value: '18 vezes' },
      { label: 'Flamengo', value: '15 vezes' },
      { label: 'Palmeiras', value: '12 vezes' },
    ],
  },
};

export default function StatisticsScreen() {
  const { user } = useAuthStore();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLottery, setSelectedLottery] = useState('megasena');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [statistics, setStatistics] = useState<any>(null);
  const [totalDraws, setTotalDraws] = useState(0);

  const loadUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const creditsData = await getCredits();
      setIsPro(creditsData?.isPro || false);
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

  const loadStatistics = async () => {
    setLoading(true);
    try {
      // 🔥 TODO: Substituir pela chamada real da API
      // const response = await fetch(`https://loterias-ia.vercel.app/api/statistics?lottery=${selectedLottery}&period=${selectedPeriod}`);
      // const data = await response.json();
      
      // Usando dados mockados para demonstração
      const mockData = MOCK_STATISTICS[selectedLottery as keyof typeof MOCK_STATISTICS] || MOCK_STATISTICS.megasena;
      setStatistics(mockData);
      setTotalDraws(156 + Math.floor(Math.random() * 100));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as estatísticas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [selectedLottery, selectedPeriod]);

  const getPeriodText = () => {
    const period = PERIODS.find(p => p.value === selectedPeriod);
    return period?.label || 'Todos';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Estatísticas</Text>
        <Text style={styles.headerSubtitle}>
          Análise completa de números, duplas e tríades
        </Text>
        {!isPro && (
          <View style={styles.proWarning}>
            <Text style={styles.proWarningText}>⭐ Plano PRO necessário para ver números reais</Text>
          </View>
        )}
      </View>

      {/* Grid de Loterias */}
      <View style={styles.gridContainer}>
        {LOTTERIES.map((lottery) => (
          <TouchableOpacity
            key={lottery.id}
            style={[
              styles.lotteryButton,
              selectedLottery === lottery.id && styles.lotteryButtonActive,
            ]}
            onPress={() => setSelectedLottery(lottery.id)}
          >
            <Text style={styles.lotteryIcon}>{lottery.icone}</Text>
            <Text style={styles.lotteryName}>{lottery.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Período Selector */}
      <View style={styles.periodContainer}>
        <Text style={styles.periodLabel}>📅 Período:</Text>
        <View style={styles.periodButtons}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Informações do período */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📊 {getPeriodText()} • {totalDraws} concursos analisados
        </Text>
      </View>

      {/* Estatísticas */}
      {statistics && (
        <View style={styles.statsContainer}>
          {/* Mais Sorteados */}
          <StatisticsCard
            title="MAIS SORTEADOS"
            icon="🔢"
            data={statistics.maisSorteados || []}
            isPro={isPro}
            showProBadge
          />

          {/* Menos Sorteados */}
          <StatisticsCard
            title="MENOS SORTEADOS"
            icon="🔢"
            data={statistics.menosSorteados || []}
            isPro={isPro}
            showProBadge
          />

          {/* Duplas */}
          <StatisticsCard
            title="DUPLAS MAIS SORTEADAS"
            icon="👥"
            data={statistics.duplas || []}
            isPro={isPro}
            showProBadge
          />

          {/* Tríades */}
          <StatisticsCard
            title="TRÍADES MAIS SORTEADAS"
            icon="🔢"
            data={statistics.triplas || []}
            isPro={isPro}
            showProBadge
          />

          {/* Times (Timemania) */}
          {selectedLottery === 'timemania' && statistics.times && (
            <StatisticsCard
              title="TIMES MAIS SORTEADOS"
              icon="⚽"
              data={statistics.times}
              isPro={isPro}
              showProBadge
            />
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 Loterias IA</Text>
      </View>
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
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#1e293b',
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  proWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  proWarningText: {
    color: '#f59e0b',
    fontSize: 12,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  lotteryButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    minWidth: 70,
  },
  lotteryButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#2d3748',
  },
  lotteryIcon: {
    fontSize: 20,
  },
  lotteryName: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  periodContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  periodLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  periodButtonText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 11,
  },
});
