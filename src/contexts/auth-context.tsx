"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AUTH_PENDING_ACTION_KEY,
  consumeOAuthPendingAction,
} from "@/lib/auth/auth-actions";
import { mapSessionToUser, mapSupabaseUser } from "@/lib/auth/map-user";
import type { ProfileRole } from "@/types/plan";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarLetter: string;
  creditsBalance?: number;
  planName?: string;
  role?: ProfileRole;
};

type AuthTab = "signin" | "signup";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthTab;
  requireAuth: (onSuccess?: () => void) => void;
  openAuthModal: (tab?: AuthTab) => void;
  closeAuthModal: () => void;
  markOAuthPending: () => void;
  updateCredits: (newBalance: number) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfileForUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, credits_balance, role, plans(name)")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

type AuthProviderProps = {
  children: React.ReactNode;
  /** Hydrated from the server so the header shows the user immediately. */
  initialUser: AuthUser | null;
};

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTab>("signin");
  const pendingCallback = useRef<(() => void) | undefined>(undefined);
  const isFirstAuthEvent = useRef(true);

  const runPendingCallback = useCallback(() => {
    const cb = pendingCallback.current;
    pendingCallback.current = undefined;
    cb?.();
  }, []);

  const syncUserFromSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setUser(mapSessionToUser(session, null));
      return;
    }

    const profile = await fetchProfileForUser(supabase, session.user.id);
    setUser(mapSessionToUser(session, profile));
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await syncUserFromSession(session);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await syncUserFromSession(session);

      if (isFirstAuthEvent.current) {
        isFirstAuthEvent.current = false;
        return;
      }

      if (event === "SIGNED_IN" && session) {
        setIsAuthModalOpen(false);

        const hadOAuthPending = consumeOAuthPendingAction();
        if (hadOAuthPending || pendingCallback.current) {
          runPendingCallback();
          router.refresh();
          return;
        }

        const redirectParam = new URL(window.location.href).searchParams.get(
          "redirect",
        );
        if (redirectParam) {
          router.push(redirectParam);
        } else {
          router.push("/auth/after-login");
        }
        router.refresh();
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        pendingCallback.current = undefined;
        isFirstAuthEvent.current = true;
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, runPendingCallback, syncUserFromSession]);

  useEffect(() => {
    if (isLoading) return;
    if (user && pendingCallback.current) {
      runPendingCallback();
    } else if (!user && pendingCallback.current) {
      setAuthModalTab("signin");
      setIsAuthModalOpen(true);
    }
  }, [isLoading, user, runPendingCallback]);

  const openAuthModal = useCallback((tab: AuthTab = "signin") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    pendingCallback.current = undefined;
  }, []);

  const markOAuthPending = useCallback(() => {
    if (pendingCallback.current) {
      sessionStorage.setItem(AUTH_PENDING_ACTION_KEY, "1");
    }
  }, []);

  const requireAuth = useCallback(
    (onSuccess?: () => void) => {
      if (user) {
        onSuccess?.();
        return;
      }

      pendingCallback.current = onSuccess;

      if (isLoading) {
        return;
      }

      openAuthModal("signin");
    },
    [user, isLoading, openAuthModal],
  );

  const updateCredits = useCallback((newBalance: number) => {
    setUser((prev) => (prev ? { ...prev, creditsBalance: newBalance } : prev));
  }, []);

  const logout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    pendingCallback.current = undefined;
    isFirstAuthEvent.current = true;
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        requireAuth,
        openAuthModal,
        closeAuthModal,
        markOAuthPending,
        updateCredits,
        logout,
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
