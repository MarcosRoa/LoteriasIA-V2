// src/stores/authStore.ts
// src/stores/authStore.ts - VERSÃO CORRIGIDA (SEM react-native import)
// src/stores/authStore.ts - VERSÃO SIMPLIFICADA (SEM ERROS)
// src/stores/authStore.ts 21/06/2026
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
  sendEmailVerification,
  reload,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE",
  authDomain: "loteriasia.firebaseapp.com",
  projectId: "loteriasia",
  storageBucket: "loteriasia.firebasestorage.app",
  messagingSenderId: "124650527048",
  appId: "1:124650527048:web:bc335922cb9e1586c3fb7d"
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  emailVerified: boolean;

  registerWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  clearError: () => void;
  sendVerificationEmail: () => Promise<boolean>;
  reloadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  emailVerified: false,

  clearError: () => set({ error: null }),

  registerWithEmail: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      
      // ✅ Enviar e-mail de verificação
      await sendEmailVerification(result.user);
      
      set({ user: result.user, isLoading: false });
      return { 
        success: true, 
        message: 'Conta criada! Verifique seu e-mail para ativar.' 
      };
    } catch (error: any) {
      let message = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') message = 'E-mail já está em uso';
      else if (error.code === 'auth/weak-password') message = 'Senha muito fraca (mínimo 6 caracteres)';
      else if (error.code === 'auth/invalid-email') message = 'E-mail inválido';
      
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // ✅ Verificar se o e-mail foi confirmado
      await reload(result.user);
      
      if (!result.user.emailVerified) {
        // Reenviar e-mail de verificação
        await sendEmailVerification(result.user);
        set({ isLoading: false });
        return false;
      }
      
      set({ user: result.user, isLoading: false });
      return true;
    } catch (error: any) {
      let message = 'Erro ao fazer login';
      if (error.code === 'auth/invalid-credential') message = 'E-mail ou senha inválidos';
      else if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado';
      else if (error.code === 'auth/wrong-password') message = 'Senha incorreta';
      else if (error.code === 'auth/too-many-requests') message = 'Muitas tentativas. Tente mais tarde';
      
      set({ error: message, isLoading: false });
      return false;
    }
  },

  sendVerificationEmail: async () => {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      await sendEmailVerification(user);
      return true;
    } catch (error) {
      console.error('Erro ao enviar verificação:', error);
      return false;
    }
  },

  reloadUser: async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await reload(user);
      set({ user: auth.currentUser });
    } catch (error) {
      console.error('Erro ao recarregar usuário:', error);
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  checkAuth: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        set({ user });
        unsubscribe();
        resolve(user);
      });
    });
  },
}));
