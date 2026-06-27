// app/_layout.tsx 27/06/2026
// app/_layout.tsx
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import TransformerSplash from '../src/components/TransformerSplash';
import LoginModal from '../src/components/LoginModal';
import { useSessionStore } from '../src/stores/sessionStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const [nativeHidden, setNativeHidden] = useState(false);
    const { showLoginModal } = useSessionStore();

    useEffect(() => {
        if (!nativeHidden) {
            SplashScreen.hideAsync()
                .catch(() => {})
                .finally(() => setNativeHidden(true));
        }
    }, [nativeHidden]);

    // 🔥 SÓ MOSTRA O VÍDEO ENQUANTO NÃO ESTIVER PRONTO
    if (!isReady) {
        return (
            <View style={styles.container}>
                <TransformerSplash onFinish={() => setIsReady(true)} />
            </View>
        );
    }

    // 🔥 SÓ DEPOIS DO VÍDEO, MOSTRA O APP
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
            </Stack>
            <LoginModal visible={showLoginModal} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
});
