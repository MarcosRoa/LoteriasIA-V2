import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getHistory } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function HistoryScreen() {
    const { user } = useAuthStore();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadHistory();
        }
    }, [user]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getHistory(user!.uid);
            setHistory(data.history || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
        );
    }

    if (history.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>📭 Nenhum palpite gerado ainda</Text>
                <Text style={styles.emptySubtext}>Gere seus primeiros palpites na tela inicial</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.lotteryName}>🎲 {item.loteria}</Text>
                            <Text style={styles.historyDate}>{formatDate(item.data)}</Text>
                        </View>
                        <View style={styles.gamesContainer}>
                            {item.jogos?.slice(0, 3).map((jogo: number[], idx: number) => (
                                <Text key={idx} style={styles.gameNumbers}>
                                    {jogo.map(n => String(n).padStart(2, '0')).join(' • ')}
                                </Text>
                            ))}
                            {item.jogos?.length > 3 && (
                                <Text style={styles.moreGames}>+ {item.jogos.length - 3} jogo(s)</Text>
                            )}
                        </View>
                        {item.filtros && (
                            <Text style={styles.filters}>⚙️ {item.filtros.substring(0, 80)}</Text>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    list: {
        padding: 16,
        gap: 12,
    },
    historyItem: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#8b5cf6',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    lotteryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#38bdf8',
    },
    historyDate: {
        fontSize: 11,
        color: '#94a3b8',
    },
    gamesContainer: {
        gap: 4,
    },
    gameNumbers: {
        fontSize: 12,
        color: '#ffffff',
        fontFamily: 'monospace',
    },
    moreGames: {
        fontSize: 11,
        color: '#f59e0b',
        marginTop: 4,
    },
    filters: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    loadingText: {
        color: '#94a3b8',
        marginTop: 12,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#64748b',
        fontSize: 12,
    },
});
