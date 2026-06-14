import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import TransformerSplash from '../src/components/TransformerSplash';

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    if (!isReady) {
        return <TransformerSplash onFinish={() => setIsReady(true)} />;
    }

    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
            </Stack>
        </>
    );
}