// js/api-client.js - VERSÃO 2.0 (Núcleo do Frontend)
// ============================================

const API_BASE = '/api';

class ApiClient {
    constructor() {
        this.token = null;
    }

    async getFirebaseToken() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const user = firebase.auth().currentUser;
                if (user) {
                    return await user.getIdToken();
                }
            } catch (e) {
                console.error('Erro ao obter token Firebase:', e);
            }
        }
        return null;
    }

    async request(endpoint, options = {}) {
        const token = await this.getFirebaseToken();
        const user = firebase.auth()?.currentUser;

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (user) {
            headers['X-User-Id'] = user.uid;
            headers['X-User-Email'] = user.email || '';
            headers['X-User-Name'] = user.displayName || '';
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw { status: response.status, ...error };
        }

        return await response.json();
    }

    // ============================================
    // CRÉDITOS
    // ============================================
    async getCredits() {
        const user = firebase.auth().currentUser;
        if (!user) return 0;

        try {
            const data = await this.request(`/credits?uid=${user.uid}`);
            return data.credits || 0;
        } catch (error) {
            console.error('Erro ao buscar créditos:', error);
            return 0;
        }
    }

    async getProStatus() {
        const user = firebase.auth().currentUser;
        if (!user) return { isPro: false, daysLeft: 0 };

        try {
            const data = await this.request(`/pro/status?uid=${user.uid}`);
            return { isPro: data.isPro || false, daysLeft: data.daysLeft || 0 };
        } catch (error) {
            console.error('Erro ao buscar status PRO:', error);
            return { isPro: false, daysLeft: 0 };
        }
    }

    // ============================================
    // GERAÇÃO DE JOGOS
    // ============================================
    async generateGames(request) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');

        try {
            const data = await this.request('/generate', {
                method: 'POST',
                body: JSON.stringify({
                    uid: user.uid,
                    lottery: request.lottery,
                    quantity: request.quantity,
                    mode: request.mode || 'ia_especialista',
                    extraNumbers: request.extraNumbers
                })
            });
            return data;
        } catch (error) {
            console.error('Erro ao gerar jogos:', error);
            throw error;
        }
    }

    // ============================================
    // PAGAMENTOS
    // ============================================
    async createPayment(amount) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');

        try {
            const data = await this.request('/payments/create', {
                method: 'POST',
                body: JSON.stringify({
                    userId: user.uid,
                    amount: amount
                })
            });
            return data;
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw error;
        }
    }

    // ============================================
    // HISTÓRICO
    // ============================================
    async getHistory(limit = 50) {
        const user = firebase.auth().currentUser;
        if (!user) return [];

        try {
            const data = await this.request(`/user/history?uid=${user.uid}&limit=${limit}`);
            return data.history || [];
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            return [];
        }
    }

    // ============================================
    // HEALTH CHECK
    // ============================================
    async getHealth() {
        try {
            const data = await this.request('/health');
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'unhealthy' };
        }
    }
}

// Instância global
const apiClient = new ApiClient();

// Exportar para uso global
window.apiClient = apiClient;
window.getCredits = () => apiClient.getCredits();
window.getProStatus = () => apiClient.getProStatus();
window.getHistory = () => apiClient.getHistory();
window.generateGames = (request) => apiClient.generateGames(request);
window.createPayment = (amount) => apiClient.createPayment(amount);

console.log('✅ API Client V2.0 carregado');
