// app/(tabs)/statistics.tsx
// app/(tabs)/statistics.tsx 24/06/2026
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
import { getCredits } from '../../src/services/api';
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

export default function StatisticsScreen() {
  const { user } = useAuthStore();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedLottery, setSelectedLottery] = useState('megasena');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [statistics, setStatistics] = useState<any>(null);
  const [totalDraws, setTotalDraws] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [user])
  );

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://loterias-ia.vercel.app/api/statistics?lottery=${selectedLottery}&period=${selectedPeriod}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setTotalDraws(data.filteredDraws || data.totalDraws || 0);
        
        if (data.frequencia && data.frequencia.length > 0) {
          setStatistics({
            maisSorteados: data.frequencia.slice(0, 20).map((item: any) => ({
              label: String(item.numero).padStart(2, '0'),
              value: `${item.quantidade} vezes`
            })),
            menosSorteados: data.frequencia.slice(-20).reverse().map((item: any) => ({
              label: String(item.numero).padStart(2, '0'),
              value: `${item.quantidade} vezes`
            })),
            duplas: data.duplas?.slice(0, 20).map((item: any) => ({
              label: `(${String(item.dupla[0]).padStart(2, '0')}, ${String(item.dupla[1]).padStart(2, '0')})`,
              value: `${item.quantidade} vezes`
            })) || [],
            triplas: data.triplas?.slice(0, 20).map((item: any) => ({
              label: `(${String(item.tripla[0]).padStart(2, '0')}, ${String(item.tripla[1]).padStart(2, '0')}, ${String(item.tripla[2]).padStart(2, '0')})`,
              value: `${item.quantidade} vezes`
            })) || [],
          });
        } else {
          setStatistics({
            maisSorteados: [],
            menosSorteados: [],
            duplas: [],
            triplas: [],
          });
        }
      } else {
        setError(data.error || 'Erro ao carregar estatísticas');
        setTotalDraws(0);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setError(error.message || 'Erro de conexão');
      setTotalDraws(0);
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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStatistics}>
          <Text style={styles.retryButtonText}>🔄 Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📊 {getPeriodText()} • {totalDraws} concursos analisados
        </Text>
      </View>

      {statistics && (
        <View style={styles.statsContainer}>
          {statistics.maisSorteados?.length > 0 ? (
            <>
              <StatisticsCard
                title="MAIS SORTEADOS (Top 20)"
                icon="🔢"
                data={statistics.maisSorteados}
                isPro={isPro}
                showProBadge
              />
              <StatisticsCard
                title="MENOS SORTEADOS (Bottom 20)"
                icon="🔢"
                data={statistics.menosSorteados}
                isPro={isPro}
                showProBadge
              />
              <StatisticsCard
                title="DUPLAS MAIS SORTEADAS (Top 20)"
                icon="👥"
                data={statistics.duplas}
                isPro={isPro}
                showProBadge
              />
              <StatisticsCard
                title="TRÍADES MAIS SORTEADAS (Top 20)"
                icon="🔢"
                data={statistics.triplas}
                isPro={isPro}
                showProBadge
              />
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>📭 Nenhum dado disponível para esta loteria e período</Text>
            </View>
          )}
        </View>
      )}

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
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
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
