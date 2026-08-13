// js/auth.js - Autenticação Firebase (V2.1)
// Google + E-mail/Senha  13/08/2026
// Facebook mantido como código comentado para não apagar a implementação.

const firebaseConfig = {
    apiKey: "AIzaSyCA_FoID7Ch8LkcwK5TbQSK23lU7BxQMuE",
    authDomain: "loteriasia.firebaseapp.com",
    projectId: "loteriasia",
    storageBucket: "loteriasia.firebasestorage.app",
    messagingSenderId: "124650527048",
    appId: "1:124650527048:web:bc335922cb9e1586c3fb7d",
    measurementId: "G-PQ8XZ46SSD"
};

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
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') console.error('Erro login Google:', e);
    } finally { loginInProgress = false; }
}

/*
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
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
    } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') console.error('Erro login Facebook:', e);
    } finally { loginInProgress = false; }
}
*/

async function loginEmail(email, password) {
    if (loginInProgress) return { success: false, message: 'Login já está sendo processado.' };
    loginInProgress = true;
    try {
        const result = await auth.signInWithEmailAndPassword(email.trim(), password);
        await result.user.reload();

        if (!result.user.emailVerified) {
            await auth.signOut();
            return { success: false, unverified: true, message: 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e tente novamente.' };
        }

        console.log('✅ Login por e-mail:', result.user.email);
        if (typeof window.processarLogin === 'function') await window.processarLogin(result.user);
        if (typeof window.fecharModalLogin === 'function') window.fecharModalLogin();
        return { success: true, user: result.user };
    } catch (e) {
        console.error('Erro login por e-mail:', e);
        let message = 'Não foi possível entrar.';
        if (['auth/invalid-credential','auth/wrong-password','auth/user-not-found'].includes(e.code)) message = 'E-mail ou senha inválidos.';
        else if (e.code === 'auth/invalid-email') message = 'E-mail inválido.';
        else if (e.code === 'auth/too-many-requests') message = 'Muitas tentativas. Tente novamente mais tarde.';
        else if (e.code === 'auth/network-request-failed') message = 'Erro de rede. Verifique sua conexão.';
        return { success: false, message };
    } finally { loginInProgress = false; }
}

async function registerEmail(email, password, name) {
    if (loginInProgress) return { success: false, message: 'Operação já está sendo processada.' };
    loginInProgress = true;
    try {
        const result = await auth.createUserWithEmailAndPassword(email.trim(), password);
        if (name && name.trim()) await result.user.updateProfile({ displayName: name.trim() });
        await result.user.sendEmailVerification();
        console.log('📧 E-mail de verificação enviado para:', result.user.email);
        await auth.signOut();
        return { success: true, message: 'Conta criada. Enviamos um e-mail de confirmação. Confirme seu endereço e depois faça login.' };
    } catch (e) {
        console.error('Erro ao criar conta por e-mail:', e);
        let message = 'Não foi possível criar a conta.';
        if (e.code === 'auth/email-already-in-use') message = 'Este e-mail já está cadastrado.';
        else if (e.code === 'auth/invalid-email') message = 'E-mail inválido.';
        else if (e.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
        else if (e.code === 'auth/network-request-failed') message = 'Erro de rede. Verifique sua conexão.';
        return { success: false, message };
    } finally { loginInProgress = false; }
}

async function resendVerificationEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email.trim(), password);
        await result.user.reload();
        if (result.user.emailVerified) {
            await auth.signOut();
            return { success: true, verified: true, message: 'Seu e-mail já está confirmado. Agora faça o login normalmente.' };
        }
        await result.user.sendEmailVerification();
        await auth.signOut();
        return { success: true, verified: false, message: 'E-mail de confirmação reenviado.' };
    } catch (e) {
        console.error('Erro ao reenviar confirmação:', e);
        return { success: false, message: 'Não foi possível reenviar o e-mail. Verifique e-mail e senha.' };
    }
}

async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email.trim());
        return { success: true, message: 'Enviamos um e-mail para redefinição da senha.' };
    } catch (e) {
        console.error('Erro ao enviar recuperação de senha:', e);
        let message = 'Não foi possível enviar o e-mail de recuperação.';
        if (e.code === 'auth/invalid-email') message = 'E-mail inválido.';
        else if (e.code === 'auth/user-not-found') message = 'Não encontramos uma conta com esse e-mail.';
        return { success: false, message };
    }
}

async function logout() {
    try {
        await auth.signOut();
        window.usuarioAtual = null;
        window.creditosUsuario = 0;
        window.isUserPro = false;
        window.proExpiresAt = null;
        window.proDiasRestantes = 0;
        if (typeof window.atualizarInterfaceUsuario === 'function') window.atualizarInterfaceUsuario();
        if (typeof window.mostrarToast === 'function') window.mostrarToast('Logout realizado!', 'success');
        setTimeout(() => window.location.reload(), 500);
    } catch (e) { console.error('Erro no logout:', e); }
}

function onAuthStateChanged(callback) { return auth.onAuthStateChanged(callback); }
function getCurrentUser() { return auth.currentUser; }

window.loginGoogle = loginGoogle;
window.loginEmail = loginEmail;
window.registerEmail = registerEmail;
window.resendVerificationEmail = resendVerificationEmail;
window.resetPassword = resetPassword;
window.logout = logout;
window.onAuthStateChanged = onAuthStateChanged;
window.getCurrentUser = getCurrentUser;
window.auth = auth;
window.isUserLoggedIn = isUserLoggedIn;

console.log('✅ AUTH.js carregado (V2.1 - Google + E-mail)');
