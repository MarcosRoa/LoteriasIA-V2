// src/stores/sessionStore.ts 14/06
import { create } from 'zustand';

interface SessionState {
  isGuest: boolean;
  showLoginModal: boolean;

  enableGuestMode: () => void;
  disableGuestMode: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isGuest: false,
  showLoginModal: true,  // Começa true

  enableGuestMode: () =>
    set({
      isGuest: true,
      showLoginModal: false,  // Fecha modal e entra como convidado
    }),

  disableGuestMode: () =>
    set({
      isGuest: false,
    }),

  openLoginModal: () =>
    set({
      showLoginModal: true,
    }),

  closeLoginModal: () =>
    set({
      showLoginModal: false,  // Fecha modal SEM login (problema!)
    }),
}));
