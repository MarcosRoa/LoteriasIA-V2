import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

export type AuthUser = User | null;

class AuthService {
    private auth = getAuth();
    private listeners: ((user: AuthUser) => void)[] = [];

    constructor() {
        onAuthStateChanged(this.auth, (user) => {
            this.listeners.forEach(listener => listener(user));
        });
    }

    getCurrentUser(): AuthUser {
        return this.auth.currentUser;
    }

    isLoggedIn(): boolean {
        return !!this.auth.currentUser;
    }

    onAuthChange(callback: (user: AuthUser) => void): () => void {
        this.listeners.push(callback);
        callback(this.auth.currentUser);
        
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    async logout(): Promise<void> {
        await this.auth.signOut();
    }
}

export const authService = new AuthService();