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
import { mapSessionToUser } from "@/lib/auth/map-user";
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

async function fetchProfileForUser(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  userId: string,
) {
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
      const profile = await fetchProfileForUser(supabase, session.user.id);
      setUser(mapSessionToUser(session, profile));
    },
    [],
  );

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserFromSession(session).finally(() => setIsLoading(false));
    });

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
      openAuthModal("signin");
    },
    [user, openAuthModal],
  );

  const logout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
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
