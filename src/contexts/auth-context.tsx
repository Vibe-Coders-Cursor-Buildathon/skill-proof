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
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  /** Open the auth modal. Pass a callback to run after the user logs in. */
  requireAuth: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "skillproof_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingCallback = useRef<(() => void) | undefined>(undefined);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback((u: AuthUser) => {
    setUser(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
    const cb = pendingCallback.current;
    pendingCallback.current = undefined;
    cb?.();
  }, []);

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

  return (
    <AuthContext.Provider
      value={{ user, isAuthModalOpen, requireAuth, closeAuthModal, login, logout }}
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
