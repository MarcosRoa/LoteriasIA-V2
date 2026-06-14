// app/(auth)/login.tsx - VERSÃO CORRIGIDA
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useGoogleAuth } from '../../src/config/googleAuth';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    
    const auth = getAuth();
    const { signInWithGoogle, request } = useGoogleAuth();

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
            if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
            if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const result = await signInWithGoogle();
        setLoading(false);
        if (result.success) {
            router.replace('/(tabs)');
        } else {
            Alert.alert('Erro', result.error || 'Não foi possível fazer login com Google');
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

            {isLoginMode ? (
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
                    
                    <TouchableOpacity onPress={() => setIsLoginMode(false)}>
                        <Text style={styles.switchText}>Não tem conta? Criar conta</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.form}>
                    <Text style={styles.infoText}>Crie sua conta agora!</Text>
                    <TouchableOpacity style={styles.registerRedirectButton} onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.registerRedirectText}>📝 Criar Conta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsLoginMode(true)}>
                        <Text style={styles.switchText}>Já tenho conta? Fazer login</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loading || !request}>
                <Text style={styles.googleButtonText}>🔐 Entrar com Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestButton} onPress={handleContinueAsGuest}>
                <Text style={styles.guestButtonText}>👤 Continuar sem login</Text>
            </TouchableOpacity>

            <Text style={styles.guestNote}>
                Você pode navegar sem login, mas para gerar palpites será necessário fazer login.
            </Text>
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
    switchText: { color: '#38bdf8', textAlign: 'center', marginTop: 15, fontSize: 14 },
    infoText: { color: '#94a3b8', textAlign: 'center', marginBottom: 20, fontSize: 14 },
    registerRedirectButton: { backgroundColor: '#10b981', borderRadius: 30, padding: 15, alignItems: 'center' },
    registerRedirectText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
    dividerText: { color: '#94a3b8', paddingHorizontal: 10 },
    googleButton: { backgroundColor: '#db4437', borderRadius: 30, padding: 15, alignItems: 'center', marginBottom: 12 },
    googleButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    guestButton: { backgroundColor: '#334155', borderRadius: 30, padding: 15, alignItems: 'center' },
    guestButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    guestNote: { color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 15 },
});