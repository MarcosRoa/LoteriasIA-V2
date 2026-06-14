// src/services/api.ts
// src/services/api.ts 14/06/2026
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = 'https://loterias-ia.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Interceptor para adicionar token Firebase e dados do usuário
api.interceptors.request.use(async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
        try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['X-User-Id'] = user.uid;
            config.headers['X-User-Email'] = user.email || '';
            config.headers['X-User-Name'] = user.displayName || user.email?.split('@')[0] || 'Usuário';
            console.log('🔐 Headers enviados:', { 
                uid: user.uid, 
                email: user.email,
                name: user.displayName 
            });
        } catch (error) {
            console.error('Erro ao obter token:', error);
        }
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ============================================
// CRÉDITOS
// ============================================
export const getCredits = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não logado');
        
        const response = await api.get(`/credits?uid=${user.uid}`);
        return response.data;
    } catch (error: any) {
        console.error('Erro ao buscar créditos:', error);
        throw error;
    }
};

// ============================================
// GERAR JOGOS
// ============================================
export const generateGames = async (data: {
    lottery: string;
    quantity: number;
    mode: string;
    extraNumbers?: number;
}) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error('Usuário não logado');
    }
    
    try {
        const response = await api.post('/generate', {
            uid: user.uid,
            lottery: data.lottery,
            quantity: data.quantity,
            mode: data.mode,
            extraNumbers: data.extraNumbers,
        });
        return response.data;
    } catch (error: any) {
        console.error('Erro ao gerar jogos:', error);
        throw error;
    }
};

// ============================================
// HISTÓRICO
// ============================================
export const getHistory = async (limit: number = 50) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não logado');
        
        const response = await api.get(`/user/history?uid=${user.uid}&limit=${limit}`);
        return response.data;
    } catch (error: any) {
        console.error('Erro ao buscar histórico:', error);
        throw error;
    }
};

// ============================================
// STATUS PRO
// ============================================
export const getProStatus = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não logado');
        
        const response = await api.get(`/pro/status?uid=${user.uid}`);
        return response.data;
    } catch (error: any) {
        console.error('Erro ao buscar status PRO:', error);
        throw error;
    }
};

// ============================================
// CRIAR PAGAMENTO
// ============================================
export const createPayment = async (amount: number) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error('Usuário não logado');
    }
    
    try {
        const response = await api.post('/payments/create', {
            userId: user.uid,
            amount: amount,
        });
        return response.data;
    } catch (error: any) {
        console.error('Erro ao criar pagamento:', error);
        throw error;
    }
};

export default api;
