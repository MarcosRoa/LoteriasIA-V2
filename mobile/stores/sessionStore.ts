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

  // Ao iniciar o app, mostramos o modal
  showLoginModal: true,

  enableGuestMode: () =>
    set({
      isGuest: true,
      showLoginModal: false,
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
      showLoginModal: false,
    }),
}));