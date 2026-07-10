// ============================================
// CAMINHO: public/js/api-client.js
// ============================================
// VERSÃO 2.1 - COMPLETA E CORRIGIDA
// ============================================

const API_BASE = '/api/proxy-ia';

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

        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
        console.log(`📤 ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw { status: response.status, ...error };
        }

        return await response.json();
    }

    // ============================================
    // 🔥 CORRIGIDO: Usar /user/status (POST) em vez de /credits (GET)
    // ============================================
    async getCredits() {
        const user = firebase.auth().currentUser;
        if (!user) return 0;
        try {
            const data = await this.request('/user/status', {
                method: 'POST',
                body: JSON.stringify({ uid: user.uid })
            });
            return data.credits || 0;
        } catch (error) {
            console.error('Erro ao buscar créditos:', error);
            return 0;
        }
    }

    // ============================================
    // 🔥 CORRIGIDO: Usar /user/status (POST) em vez de /pro/status (GET)
    // ============================================
    async getProStatus() {
        const user = firebase.auth().currentUser;
        if (!user) return { isPro: false, daysLeft: 0 };
        try {
            const data = await this.request('/user/status', {
                method: 'POST',
                body: JSON.stringify({ uid: user.uid })
            });
            return { 
                isPro: data.isPro || false, 
                daysLeft: data.daysLeft || 0 
            };
        } catch (error) {
            console.error('Erro ao buscar status PRO:', error);
            return { isPro: false, daysLeft: 0 };
        }
    }

    // ============================================
    // 🔥 CORRIGIDO: Usar /generate (POST) com os parâmetros corretos
    // ============================================
    async generateGames(request) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');
        
        try {
            const body = {
                uid: user.uid,
                lottery: request.lottery,
                quantity: request.quantity,
                mode: request.mode || 'hybrid',
                extraNumbers: request.extraNumbers || 0,
                period: request.filters?.periodo || 'all',
                dispersao: request.filters?.dispersao || 15
            };
            
            console.log('📤 Enviando requisição:', body);
            
            return await this.request('/generate', {
                method: 'POST',
                body: JSON.stringify(body)
            });
        } catch (error) {
            console.error('❌ Erro ao gerar jogos:', error);
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
            return await this.request('/user/status', {
                method: 'POST',
                body: JSON.stringify({ uid: user.uid })
            });
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

console.log('✅ API Client V2.1 carregado');
