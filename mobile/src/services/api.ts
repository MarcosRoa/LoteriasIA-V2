// src/services/api.ts
// src/services/api.ts 24/06/2026
// src/services/api.ts
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
        } catch (error) {
            console.error('Erro ao obter token:', error);
        }
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const getCredits = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não logado');
        
        const response = await api.get(`/credits?uid=${user.uid}`);
        
        if (!response.data || typeof response.data !== 'object') {
            console.error('❌ Resposta inválida de /credits:', response.data);
            return { credits: 0, isPro: false };
        }
        
        return {
            credits: response.data.credits || 0,
            isPro: response.data.isPro || false
        };
    } catch (error: any) {
        console.error('❌ Erro ao buscar créditos:', error);
        return { credits: 0, isPro: false };
    }
};

// ✅ GERAR JOGOS COM PERÍODO E DISPERSÃO
export const generateGames = async (data: {
    lottery: string;
    quantity: number;
    mode: string;
    extraNumbers?: number;
    period?: string | number;
    dispersao?: number;
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
            period: data.period || 'all',
            dispersao: data.dispersao || 15,
        });
        return response.data;
    } catch (error: any) {
        console.error('Erro ao gerar jogos:', error);
        throw error;
    }
};

export const getHistory = async (uid: string, limit: number = 50) => {
    try {
        const response = await api.get(`/user/history?uid=${uid}&limit=${limit}`);
        return response.data;
    } catch (error: any) {
        console.error('Erro ao buscar histórico:', error);
        return { history: [] };
    }
};

export const getProStatus = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não logado');
        
        const response = await api.get(`/pro/status?uid=${user.uid}`);
        return response.data || { isPro: false, daysLeft: 0 };
    } catch (error: any) {
        console.error('Erro ao buscar status PRO:', error);
        return { isPro: false, daysLeft: 0 };
    }
};

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
