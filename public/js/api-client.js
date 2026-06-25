// js/api-client.js - VERSÃO 2.0 (Núcleo do Frontend)
// ============================================
// api-client.js - V2.0
// api-client.js - V2.0
// js/api-client.js - VERSÃO 2.0 (Núcleo do Frontend)
// ============================================
// api-client.js - V2.0 16/06/2026

const API_BASE = '/api';

class ApiClient {
    async getFirebaseToken() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                const user = firebase.auth().currentUser;
                if (user) return await user.getIdToken();
            } catch (e) {
                console.error('Erro ao obter token Firebase:', e);
            }
        }
        return null;
    }

    async request(endpoint, options = {}) {
        const token = await this.getFirebaseToken();
        const user = firebase.auth()?.currentUser;

        const headers = { 'Content-Type': 'application/json', ...options.headers };

        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (user) {
            headers['X-User-Id'] = user.uid;
            headers['X-User-Email'] = user.email || '';
            headers['X-User-Name'] = user.displayName || '';
        }

        const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw { status: response.status, ...error };
        }

        return await response.json();
    }

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

    // 🔧 CORREÇÃO: Adicionar filters, dados e dadosExtras
    async generateGames(request) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');
        
        try {
            return await this.request('/generate', {
                method: 'POST',
                body: JSON.stringify({
                    uid: user.uid,
                    lottery: request.lottery,
                    quantity: request.quantity,
                    mode: request.mode || 'ia_especialista',
                    extraNumbers: request.extraNumbers || 0,
                    // 🔧 CORREÇÃO: Enviar dados necessários para a IA
                    filters: request.filters || {},
                    dados: request.dados || [],
                    dadosExtras: request.dadosExtras || []
                })
            });
        } catch (error) {
            console.error('Erro ao gerar jogos:', error);
            throw error;
        }
    }

    async createPayment(amount) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');
        try {
            return await this.request('/payments/create', {
                method: 'POST',
                body: JSON.stringify({ userId: user.uid, amount })
            });
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw error;
        }
    }
    
    async getUserStatus() {
        const user = firebase.auth().currentUser;
        if (!user) {
            return { 
                success: false, 
                error: 'Usuário não logado', 
                isPro: false, 
                credits: 0,
                proExpiresAt: null,
                daysLeft: 0
            };
        }
        
        try {
            // 🔥 Usa o endpoint /api/pro/status (GET) ou /api/user/status (POST)
            const response = await fetch(`${API_BASE}/pro/status?uid=${user.uid}`, {
                credentials: 'include'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar status do usuário:', error);
            return { 
                success: false, 
                error: error.message, 
                isPro: false, 
                credits: 0,
                proExpiresAt: null,
                daysLeft: 0
            };
        }
    }
    
}

const apiClient = new ApiClient();

window.apiClient = apiClient;
window.getCredits = () => apiClient.getCredits();
window.getProStatus = () => apiClient.getProStatus();
window.generateGames = (request) => apiClient.generateGames(request);
window.createPayment = (amount) => apiClient.createPayment(amount);

console.log('✅ API Client V2.0 carregado');
