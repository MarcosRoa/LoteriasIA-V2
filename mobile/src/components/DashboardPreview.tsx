import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const LOTERIAS = [
  'Mega-Sena',
  'Lotofácil',
  'Quina',
  'Lotomania',
  'Dupla Sena',
  'Timemania',
  '+Milionária',
  'Loteca',
  'Dia de Sorte',
  'Super Sete',
];

export default function DashboardPreview() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🦁 ROA IA</Text>

          <Text style={styles.subtitle}>
            Inteligência Artificial para Loterias
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>125</Text>
            <Text style={styles.cardLabel}>Créditos</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardValue}>PRO</Text>
            <Text style={styles.cardLabel}>Plano</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Escolha sua loteria
        </Text>

        <View style={styles.grid}>
          {LOTERIAS.map((loteria) => (
            <TouchableOpacity
              key={loteria}
              style={styles.lotteryCard}
            >
              <Text style={styles.lotteryText}>
                {loteria}
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fbbf24',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },

  card: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },

  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  cardLabel: {
    marginTop: 4,
    color: '#94a3b8',
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  grid: {
    gap: 12,
  },

  lotteryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },

  lotteryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});