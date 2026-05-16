"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type AuthUser = {
  name: string;
  email: string;
  avatarLetter: string;
  credits: number;
  plan: "free" | "individual" | "pro";
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  /** Open the auth modal. If the user is already logged in, fires onSuccess immediately. */
  requireAuth: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  /** Returns true if a pending post-login action (e.g. course generation) was run. */
  login: (user: AuthUser) => boolean;
  logout: () => void;
  /** Spend one credit. Returns false if not enough credits. */
  spendCredit: () => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "skillproof_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingCallback = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
  }, []);

  const persistUser = useCallback((u: AuthUser) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    (u: AuthUser): boolean => {
      setUser(u);
      persistUser(u);
      setIsAuthModalOpen(false);
      const hadPending = Boolean(pendingCallback.current);
      const cb = pendingCallback.current;
      pendingCallback.current = undefined;
      cb?.();
      return hadPending;
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const requireAuth = useCallback(
    (onSuccess?: () => void) => {
      if (user) {
        onSuccess?.();
        return;
      }
      pendingCallback.current = onSuccess;
      setIsAuthModalOpen(true);
    },
    [user],
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    pendingCallback.current = undefined;
  }, []);

  const spendCredit = useCallback(() => {
    if (!user || user.credits <= 0) return false;
    const updated: AuthUser = { ...user, credits: user.credits - 1 };
    setUser(updated);
    persistUser(updated);
    return true;
  }, [user, persistUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        requireAuth,
        closeAuthModal,
        login,
        logout,
        spendCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
