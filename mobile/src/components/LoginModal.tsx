// src/components/LoginModal.tsx - VERIFIQUE ESTAS PARTES 15/06
// src/components/LoginModal.tsx 26/06/2026
// src/components/LoginModal.tsx 26/06/2026
// src/components/LoginModal.tsx
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
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

import { useAuthStore } from '../stores/authStore';
import { useSessionStore } from '../stores/sessionStore';

interface LoginModalProps {
  visible: boolean;
}

export default function LoginModal({ visible }: LoginModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');

  const { user, loginWithEmail, registerWithEmail, error, isLoading, clearError } = useAuthStore();
  const { closeLoginModal, enableGuestMode } = useSessionStore();

  React.useEffect(() => {
    if (user) {
      clearError();
      closeLoginModal();
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Informe o seu e-mail.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Informe a sua senha.');
      return;
    }

    const result = await loginWithEmail(email.trim(), password);

    if (result.success) {
      setName('');
      setEmail('');
      setPassword('');
      setIsRegisterMode(false);
      clearError();
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } else {
      Alert.alert('Atenção', result.message || 'Não foi possível realizar o login.');
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

    const result = await registerWithEmail(email.trim(), password, name.trim());

    if (result.success) {
      setRegistrationEmail(email.trim());
      setShowVerificationMessage(true);
      setEmail('');
      setPassword('');
      setName('');
      setIsRegisterMode(false);
      clearError();
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  // ✅ RECUPERAÇÃO DE SENHA
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Informe o seu e-mail para recuperar a senha.');
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        '✅ E-mail enviado!',
        `Enviamos um link para ${email.trim()} para criar uma nova senha.`
      );
    } catch (error: any) {
      let message = 'Erro ao enviar e-mail de recuperação.';
      if (error.code === 'auth/user-not-found') {
        message = 'E-mail não encontrado. Verifique ou crie uma conta.';
      }
      Alert.alert('Erro', message);
    }
  };

  const handleGuest = () => {
    enableGuestMode();
    Alert.alert('Modo Convidado', 'Você pode navegar, mas para gerar palpites precisa fazer login.');
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    clearError();
    setShowVerificationMessage(false);
  };

  // Tela de verificação
  if (showVerificationMessage) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.verificationTitle}>📧 Verifique seu e-mail</Text>
            <Text style={styles.verificationText}>
              Enviamos um link de confirmação para:
            </Text>
            <Text style={styles.verificationEmail}>{registrationEmail}</Text>
            <Text style={styles.verificationText}>
              Clique no link para ativar sua conta e depois faça login.
            </Text>
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={async () => {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                  try {
                    await sendEmailVerification(user);
                    Alert.alert('Sucesso', 'Novo e-mail enviado!');
                  } catch (e) {
                    Alert.alert('Erro', 'Não foi possível reenviar.');
                  }
                }
              }}
            >
              <Text style={styles.verificationButtonText}>📨 Reenviar e-mail</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.verificationBackButton}
              onPress={() => {
                setShowVerificationMessage(false);
                setRegistrationEmail('');
                clearError();
              }}
            >
              <Text style={styles.verificationBackText}>← Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {isRegisterMode ? 'Criar Conta' : 'Bem-vindo!'}
          </Text>

          {isRegisterMode && (
            <TextInput
              placeholder="Nome completo"
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

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>

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
            <>
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

              {/* ✅ BOTÃO ESQUECI MINHA SENHA */}
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>🔑 Esqueci minha senha</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.switchText}>
              {isRegisterMode
                ? 'Já tenho conta? Fazer login'
                : 'Não tem conta? Criar conta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGuest}>
            <Text style={styles.guestText}>Entrar como Convidado</Text>
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
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginTop: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    padding: 15,
  },
  eyeButton: {
    padding: 15,
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
  forgotPasswordText: {
    color: '#38bdf8',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  verificationTitle: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  verificationEmail: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  verificationButton: {
    backgroundColor: '#8b5cf6',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  verificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  verificationBackButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  verificationBackText: {
    color: '#64748b',
    fontSize: 14,
  },
});
