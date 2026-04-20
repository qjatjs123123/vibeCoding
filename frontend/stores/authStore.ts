import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  avatarUrl?: string;
  token: string;
  needsUsername?: boolean; // 첫 로그인 후 username 설정 필요 여부
}

export interface AuthState {
  // 상태
  session: AuthSession | null;
  isLoading: boolean;

  // 액션
  setSession: (session: AuthSession | null) => void;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUsername: (username: string) => void;
  reset: () => void;
}

/**
 * 인증 상태 관리 (Zustand + localStorage)
 * - 로그인/로그아웃
 * - 세션 저장
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,

      setSession: (session) => set({ session }),

      login: (session) =>
        set({
          session,
          isLoading: false,
        }),

      logout: () =>
        set({
          session: null,
          isLoading: false,
        }),

      updateUsername: (username) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              username,
              needsUsername: false,
            },
          };
        }),

      reset: () =>
        set({
          session: null,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-store',
      version: 1,
    }
  )
);
