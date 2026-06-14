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
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

// Configurar auth padrão (sem persistência customizada)
const auth = getAuth(app);

// Configurar persistência manualmente
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

// Para React Native, usamos a persistência padrão
// O AsyncStorage não é necessário para o funcionamento básico

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      set({ user: result.user, isLoading: false });
      return true;
    } catch (error: any) {
      console.log('Erro no login:', error.code);
      let message = 'Erro ao fazer login';

      if (error.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha inválidos';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Senha incorreta';
      }

      set({ error: message, isLoading: false });
      return false;
    }
  },

  registerWithEmail: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      set({ user: result.user, isLoading: false });
      return true;
    } catch (error: any) {
      console.log('Erro no registro:', error.code);
      let message = 'Erro ao criar conta';

      if (error.code === 'auth/email-already-in-use') {
        message = 'E-mail já está em uso';
      } else if (error.code === 'auth/weak-password') {
        message = 'Senha muito fraca (mínimo 6 caracteres)';
      }

      set({ error: message, isLoading: false });
      return false;
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
