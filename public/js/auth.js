// js/auth.js - Autenticação Firebase (V2.0)
// As chaves agora vêm de variáveis de ambiente (configuradas na Vercel)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Fallback para desenvolvimento (se as variáveis não estiverem configuradas)
if (!firebaseConfig.apiKey) {
    console.warn('⚠️ Firebase config não encontrada. Usando fallback local.');
    // Fallback apenas para desenvolvimento
    if (window.location.hostname === 'localhost') {
        firebaseConfig.apiKey = "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE";
        firebaseConfig.authDomain = "loteriasia.firebaseapp.com";
        firebaseConfig.projectId = "loteriasia";
        firebaseConfig.storageBucket = "loteriasia.firebasestorage.app";
        firebaseConfig.messagingSenderId = "124650527048";
        firebaseConfig.appId = "1:124650527048:web:bc335922cb9e1586c3fb7d";
    }
}

if (typeof firebase !== 'undefined' && (!firebase.apps || firebase.apps.length === 0)) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado');
}

const auth = firebase.auth();
let loginInProgress = false;

function isUserLoggedIn() { return !!auth.currentUser; }

async function loginGoogle() {
    if (isUserLoggedIn()) {
        if (typeof window.processarLogin === 'function') await window.processarLogin(auth.currentUser);
        return;
    }
    if (loginInProgress) return;
    loginInProgress = true;
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        console.log('✅ Login Google:', result.user?.email);
        if (typeof window.processarLogin === 'function') await window.processarLogin(result.user);
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') console.error('Erro login Google:', e);
    } finally { loginInProgress = false; }
}

async function loginFacebook() {
    if (isUserLoggedIn()) {
        if (typeof window.processarLogin === 'function') await window.processarLogin(auth.currentUser);
        return;
    }
    if (loginInProgress) return;
    loginInProgress = true;
    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        const result = await auth.signInWithPopup(provider);
        console.log('✅ Login Facebook:', result.user?.email);
        if (typeof window.processarLogin === 'function') await window.processarLogin(result.user);
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') console.error('Erro login Facebook:', e);
    } finally { loginInProgress = false; }
}

async function logout() {
    try {
        await auth.signOut();
        window.usuarioAtual = null;
        window.creditosUsuario = 0;
        window.isUserPro = false;
        if (typeof window.atualizarInterfaceUsuario === 'function') window.atualizarInterfaceUsuario();
        if (typeof window.mostrarToast === 'function') window.mostrarToast('Logout realizado!', 'success');
        setTimeout(() => window.location.reload(), 500);
    } catch (e) { console.error('Erro no logout:', e); }
}

function onAuthStateChanged(callback) { return auth.onAuthStateChanged(callback); }
function getCurrentUser() { return auth.currentUser; }

window.loginGoogle = loginGoogle;
window.loginFacebook = loginFacebook;
window.logout = logout;
window.onAuthStateChanged = onAuthStateChanged;
window.getCurrentUser = getCurrentUser;
window.auth = auth;
window.isUserLoggedIn = isUserLoggedIn;

console.log('✅ AUTH.js carregado (V2.0)');
