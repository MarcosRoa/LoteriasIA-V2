import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';
import { useGoogleAuth } from '../config/googleAuth';

interface LoginModalProps {
  visible: boolean;
}

export default function LoginModal({ visible }: LoginModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const { loginWithEmail, registerWithEmail, error, isLoading } = useAuthStore();
  const { closeLoginModal, enableGuestMode } = useSessionStore();
  const { signInWithGoogle, request } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Informe o seu e-mail.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Informe a sua senha.');
      return;
    }

    const success = await loginWithEmail(email.trim(), password);

    if (success) {
      setName('');
      setEmail('');
      setPassword('');
      setIsRegisterMode(false);
      closeLoginModal();
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } else {
      Alert.alert('Erro', error || 'Não foi possível realizar o login.');
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Informe o seu nome.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Informe o seu e-mail.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Informe a sua senha.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const success = await registerWithEmail(email.trim(), password, name.trim());

    if (success) {
      setName('');
      setEmail('');
      setPassword('');
      setIsRegisterMode(false);
      closeLoginModal();
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
    } else {
      Alert.alert('Erro', error || 'Não foi possível criar a conta.');
    }
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      setName('');
      setEmail('');
      setPassword('');
      setIsRegisterMode(false);
      closeLoginModal();
      Alert.alert('Sucesso', 'Login com Google realizado!');
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível fazer login com Google');
    }
  };

  const handleGuest = () => {
    enableGuestMode();
    closeLoginModal();
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {isRegisterMode ? 'Criar Conta' : 'Bem-vindo!'}
          </Text>

          {/* Botão Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={!request}
          >
            <Text style={styles.googleButtonText}>Continuar com Google Login</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {isRegisterMode && (
            <TextInput
              placeholder="Nome"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          )}

          <TextInput
            placeholder="E-mail"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {isRegisterMode ? (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerText}>✅ Criar Conta</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>🔐 Entrar</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.switchText}>
              {isRegisterMode
                ? 'Já tenho conta? Fazer login'
                : 'Não tem conta? Criar conta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGuest}>
            <Text style={styles.guestText}>Entrar sem login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#db4437',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  registerText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  switchText: {
    color: '#38bdf8',
    textAlign: 'center',
    marginTop: 15,
  },
  guestText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 15,
  },
});