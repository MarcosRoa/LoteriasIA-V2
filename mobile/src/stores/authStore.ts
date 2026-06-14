// src/stores/authStore.ts
// src/stores/authStore.ts - VERSÃO CORRIGIDA (SEM react-native import)
// src/stores/authStore.ts - VERSÃO SIMPLIFICADA (SEM ERROS)
// src/stores/authStore.ts - VERSÃO SEM PERSISTÊNCIA (FUNCIONA) 14/06
import { create } from 'zustand';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE",
  authDomain: "loteriasia.firebaseapp.com",
  projectId: "loteriasia",
  storageBucket: "loteriasia.firebasestorage.app",
  messagingSenderId: "124650527048",
  appId: "1:124650527048:web:bc335922cb9e1586c3fb7d"
};

// Inicializar Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// Inicializar Auth - SEM persistência customizada
const auth = getAuth(app);

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login realizado:', result.user.uid);
      set({ user: result.user, isLoading: false });
      return true;
    } catch (error: any) {
      console.log('❌ Erro no login:', error.code);
      let message = 'Erro ao fazer login';
      if (error.code === 'auth/invalid-credential') message = 'E-mail ou senha inválidos';
      else if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
      else if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
      else if (error.code === 'auth/too-many-requests') message = 'Muitas tentativas. Tente mais tarde';
      else if (error.code === 'auth/network-request-failed') message = 'Erro de rede. Verifique sua conexão';
      
      set({ error: message, isLoading: false });
      return false;
    }
  },

  registerWithEmail: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      console.log('✅ Conta criada:', result.user.uid, result.user.email);
      set({ user: result.user, isLoading: false });
      return true;
    } catch (error: any) {
      console.log('❌ Erro no registro:', error.code);
      let message = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') message = 'E-mail já está em uso';
      else if (error.code === 'auth/weak-password') message = 'Senha muito fraca (mínimo 6 caracteres)';
      else if (error.code === 'auth/invalid-email') message = 'E-mail inválido';
      else if (error.code === 'auth/network-request-failed') message = 'Erro de rede. Verifique sua conexão';
      
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  },

  checkAuth: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('📡 Auth state changed:', user?.uid || 'null', user?.email || '');
        set({ user });
        unsubscribe();
        resolve(user);
      });
    });
  },
}));
