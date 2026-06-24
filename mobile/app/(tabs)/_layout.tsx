// app/generate.tsx (versão original mantida, apenas com pequenas melhorias)
// app/(tabs)/_layout.tsx 24/06/2026
// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LoginModal from '../../src/components/LoginModal';
import { useSessionStore } from '../../src/stores/sessionStore';

export default function TabLayout() {
    const { showLoginModal } = useSessionStore();

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        backgroundColor: '#1e293b',
                        borderTopColor: '#8b5cf6',
                        paddingBottom: 5,
                        paddingTop: 5,
                        height: 60,
                    },
                    tabBarActiveTintColor: '#8b5cf6',
                    tabBarInactiveTintColor: '#94a3b8',
                    headerStyle: { backgroundColor: '#0f172a' },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: '  🧠 Sistema Profissional com IA 🧠',
                        tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="generate"
                    options={{
                        title: 'Gerar',
                        tabBarIcon: ({ color, size }) => <Ionicons name="dice" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="statistics"  // ✅ NOVA ABA
                    options={{
                        title: '📊 Estatísticas',
                        tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: 'Histórico',
                        tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Perfil',
                        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="pro"
                    options={{
                        title: '⭐ PRO',
                        tabBarIcon: ({ color, size }) => <Ionicons name="star" size={size} color={color} />,
                    }}
                />
            </Tabs>

            <LoginModal visible={showLoginModal} />
        </>
    );
}
