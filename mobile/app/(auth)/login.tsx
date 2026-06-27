// app/(auth)/login.tsx - VERSÃO CORRIGIDA
// app/(auth)/login.tsx - VERSÃO CORRIGIDA 26/06/2026
// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha e-mail e senha');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            let message = 'Erro ao fazer login';
            if (error.code === 'auth/invalid-credential') message = 'E-mail ou senha inválidos';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueAsGuest = () => {
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <View style={styles.header}>
                <Text style={styles.title}>🧠 Loterias IA</Text>
                <Text style={styles.subtitle}>Sistema Profissional com IA Real</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                
                <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>🔐 Entrar</Text>}
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.guestButton} onPress={handleContinueAsGuest}>
                <Text style={styles.guestButtonText}>👤 Continuar sem login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 50 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
    form: { width: '100%', marginBottom: 20 },
    input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
    loginButton: { backgroundColor: '#8b5cf6', borderRadius: 30, padding: 15, alignItems: 'center', marginTop: 10 },
    loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    guestButton: { backgroundColor: '#334155', borderRadius: 30, padding: 15, alignItems: 'center' },
    guestButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
