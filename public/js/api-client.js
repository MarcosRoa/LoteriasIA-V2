// ============================================
// CAMINHO: public/js/api-client.js
// ============================================
// VERSÃO 2.3 - OTIMIZADA (SEM DUPLICAÇÃO)
// ============================================

const API_BASE = '/api';

// ============================================
// LOG CONDICIONAL (apenas em desenvolvimento)
// ============================================
function log(...args) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args);
    }
}

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
        log(`📤 ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw { status: response.status, ...error };
        }

        return await response.json();
    }

    // ============================================
    // 🔥 UNIFICADO: getUserStatus() retorna TUDO
    // ============================================
    async getUserStatus() {
        const user = firebase.auth().currentUser;
        if (!user) {
            return {
                success: false,
                error: 'Usuário não logado',
                isPro: false,
                credits: 0,
                proExpiresAt: null,
                daysLeft: 0,
                nome: '',
                email: '',
                foto: null
            };
        }

        try {
            const data = await this.request('/user/status', {
                method: 'POST',
                body: JSON.stringify({ uid: user.uid })
            });

            return {
                success: data.success || false,
                isPro: data.isPro || false,
                credits: data.credits || 0,
                proExpiresAt: data.proExpiresAt || null,
                daysLeft: data.daysLeft || 0,
                nome: data.user?.nome || user.displayName || user.email?.split('@')[0] || 'Usuário',
                email: data.user?.email || user.email || '',
                foto: data.user?.foto || null
            };
        } catch (error) {
            console.error('❌ Erro ao buscar status do usuário:', error);
            return {
                success: false,
                error: error.message,
                isPro: false,
                credits: 0,
                proExpiresAt: null,
                daysLeft: 0,
                nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
                email: user.email || '',
                foto: null
            };
        }
    }

    // ============================================
    // 🔥 DEPRECIADO: Use getUserStatus() em vez disso
    // ============================================
    async getCredits() {
        console.warn('⚠️ getCredits() está depreciado. Use getUserStatus()');
        const status = await this.getUserStatus();
        return status.credits || 0;
    }

    async getProStatus() {
        console.warn('⚠️ getProStatus() está depreciado. Use getUserStatus()');
        const status = await this.getUserStatus();
        return { isPro: status.isPro || false, daysLeft: status.daysLeft || 0 };
    }

    // ============================================
    // 🔥 IA: Envia TODOS os dados necessários
    // ============================================
    async generateGames(request) {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not logged in');

        try {
            // 🔥 ENVIA TODOS OS DADOS NECESSÁRIOS PARA A IA
            const body = {
                uid: user.uid,
                lottery: request.lottery,
                quantity: request.quantity,
                mode: request.mode || 'hybrid',
                extraNumbers: request.extraNumbers || 0,
                period: request.filters?.periodo || 'all',
                dispersao: request.filters?.dispersao || 15,

                // 🔥 IMPORTANTE: Dados históricos para a IA
                dados: request.dados || [],
                dadosExtras: request.dadosExtras || [],
                filters: request.filters || {}
            };

            log('📤 Enviando requisição para IA (Railway):', {
                lottery: body.lottery,
                quantity: body.quantity,
                mode: body.mode,
                extraNumbers: body.extraNumbers,
                dadosLength: body.dados?.length || 0
            });

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
}

const apiClient = new ApiClient();

window.apiClient = apiClient;

// 🔥 RECOMENDADO: Usar getUserStatus() para tudo
window.getUserStatus = () => apiClient.getUserStatus();

// 🔥 DEPRECIADO: Manter para compatibilidade
window.getCredits = () => apiClient.getCredits();
window.getProStatus = () => apiClient.getProStatus();
window.generateGames = (request) => apiClient.generateGames(request);
window.createPayment = (amount) => apiClient.createPayment(amount);
window.getHistory = (limit) => apiClient.getHistory(limit);

console.log('✅ API Client V2.3 carregado (Otimizado - getUserStatus unificado)');
