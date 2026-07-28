// ============================================
// CAMINHO: public/js/api-client.js
// ============================================
// VERSÃO 2.4 - SEM SIMULAÇÃO DE PAGAMENTO
// ============================================

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
    // 🔥 USUÁRIO: Vai para /api/user/status (Vercel + Supabase)
    // ============================================
    async getCredits() {
        const user = firebase.auth().currentUser;
        if (!user) return 0;
        try {
            const data = await this.request('/credits', {
                method: 'GET',
                headers: {
                    'X-User-Id': user.uid,
                    'X-User-Email': user.email || '',
                    'X-User-Name': user.displayName || ''
                }
            });
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
            const data = await this.request('/pro/status', {
                method: 'GET',
                headers: {
                    'X-User-Id': user.uid,
                    'X-User-Email': user.email || '',
                    'X-User-Name': user.displayName || ''
                }
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

    // ============================================
    // 🔥 IA: Vai para /api/generate (Vercel → Railway)
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

            console.log('📤 Enviando requisição para IA (Railway):', body);

            return await this.request('/generate', {
                method: 'POST',
                body: JSON.stringify(body)
            });
        } catch (error) {
            console.error('❌ Erro ao gerar jogos:', error);
            throw error;
        }
    }

    // ============================================
    // 🔥 ESTATÍSTICAS: Vai para /api/statistics (Vercel → Railway)
    // ============================================
    async getStatistics(lottery, period = 'all') {
        try {
            return await this.request(`/statistics?lottery=${lottery}&period=${period}`, {
                method: 'GET'
            });
        } catch (error) {
            console.error('❌ Erro ao buscar estatísticas:', error);
            throw error;
        }
    }

    // ============================================
    // 🔥 HISTÓRICO: Vai para /api/user/history (Vercel + Supabase)
    // ============================================
    async getHistory(limit = 50) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');
        try {
            return await this.request(`/user/history?uid=${user.uid}&limit=${limit}`, {
                method: 'GET'
            });
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            throw error;
        }
    }

    // ============================================
    // 🔥 TRANSAÇÕES: Vai para /api/user/transactions (Vercel + Supabase)
    // ============================================
    async getTransactions(dias = 30) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');
        try {
            return await this.request(`/user/transactions?uid=${user.uid}&dias=${dias}`, {
                method: 'GET'
            });
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
            throw error;
        }
    }
}

const apiClient = new ApiClient();

// ============================================
// EXPORTAÇÕES (SEM createPayment)
// ============================================
window.apiClient = apiClient;
window.getCredits = () => apiClient.getCredits();
window.getProStatus = () => apiClient.getProStatus();
window.generateGames = (request) => apiClient.generateGames(request);
window.getHistory = (limit) => apiClient.getHistory(limit);
window.getStatistics = (lottery, period) => apiClient.getStatistics(lottery, period);
window.getTransactions = (dias) => apiClient.getTransactions(dias);

console.log('✅ API Client V2.4 carregado (Vercel + Railway + Statistics)');
