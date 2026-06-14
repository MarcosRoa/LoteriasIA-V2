// app/(auth)/register.tsx - VERSÃO CORRIGIDA
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: name });
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            router.replace('/(tabs)');
        } catch (error: any) {
            let message = 'Erro ao criar conta';
            if (error.code === 'auth/email-already-in-use') message = 'E-mail já está em uso';
            if (error.code === 'auth/weak-password') message = 'Senha muito fraca';
            Alert.alert('Erro', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <View style={styles.header}>
                <Text style={styles.title}>📝 Criar Conta</Text>
                <Text style={styles.subtitle}>Cadastre-se para gerar palpites</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#94a3b8"
                    value={name}
                    onChangeText={setName}
                />
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
                    placeholder="Senha (mínimo 6 caracteres)"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#94a3b8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                
                <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>✅ Criar Conta</Text>}
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.loginText}>Já tenho conta? Fazer login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a', padding: 20, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
    form: { width: '100%' },
    input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 15, marginBottom: 15, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: '#334155' },
    registerButton: { backgroundColor: '#10b981', borderRadius: 30, padding: 15, alignItems: 'center', marginTop: 10 },
    registerButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    loginText: { color: '#38bdf8', textAlign: 'center', marginTop: 20, fontSize: 14 },
});