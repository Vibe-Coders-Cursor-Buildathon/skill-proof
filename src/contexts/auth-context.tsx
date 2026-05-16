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

import {
  AUTH_PENDING_ACTION_KEY,
  consumeOAuthPendingAction,
} from "@/lib/auth/auth-actions";
import { mapSessionToUser, mapSupabaseUser } from "@/lib/auth/map-user";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarLetter: string;
  creditsBalance?: number;
  planName?: string;
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
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfileForUser(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("display_name, credits_balance, plans(name)")
    .eq("id", userId)
    .single();

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTab>("signin");
  const pendingCallback = useRef<(() => void) | undefined>(undefined);

  const runPendingCallback = useCallback(() => {
    const cb = pendingCallback.current;
    pendingCallback.current = undefined;
    cb?.();
  }, []);

  const syncUserFromSession = useCallback(
    async (session: Session | null) => {
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
    },
    [],
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const profile = await fetchProfileForUser(supabase, authUser.id);
        setUser(mapSupabaseUser(authUser, profile));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await syncUserFromSession(session);

      if (event === "SIGNED_IN" && session) {
        setIsAuthModalOpen(false);

        const hadOAuthPending = consumeOAuthPendingAction();
        if (hadOAuthPending || pendingCallback.current) {
          runPendingCallback();
        }

        router.refresh();
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        pendingCallback.current = undefined;
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, runPendingCallback, syncUserFromSession]);

  // Run queued action after session finishes loading (e.g. user clicked Generate while hydrating)
  useEffect(() => {
    if (!isLoading && user && pendingCallback.current) {
      runPendingCallback();
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

      // Session may exist in cookies before React user state is hydrated
      if (isLoading) {
        pendingCallback.current = onSuccess;
        return;
      }

      void (async () => {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) {
          pendingCallback.current = onSuccess;
          openAuthModal("signin");
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await syncUserFromSession(session);
          onSuccess?.();
          return;
        }

        pendingCallback.current = onSuccess;
        openAuthModal("signin");
      })();
    },
    [user, isLoading, openAuthModal, syncUserFromSession],
  );

  const logout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    pendingCallback.current = undefined;
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
