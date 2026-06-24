// src/components/StatisticsCard.tsx 24/06/20206
// src/components/StatisticsCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface StatisticsCardProps {
  title: string;
  icon: string;
  data: { label: string; value: string | number }[];
  isPro: boolean;
  showProBadge?: boolean;
}

export default function StatisticsCard({ 
  title, 
  icon, 
  data, 
  isPro, 
  showProBadge = false 
}: StatisticsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{icon} {title}</Text>
        {showProBadge && !isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>⭐ PRO</Text>
          </View>
        )}
      </View>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {data.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={[styles.label, !isPro && styles.labelBlocked]}>
              {isPro ? item.label : '⭐⭐ PRO ⭐⭐'}
            </Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  proBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  list: {
    maxHeight: 220,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  label: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '500',
  },
  labelBlocked: {
    color: '#f59e0b',
  },
  value: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
  },
});
