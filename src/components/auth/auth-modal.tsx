"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, GraduationCap, Loader2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth, type AuthUser } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

type Tab = "signin" | "signup";

const FREE_CREDITS = 3;

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setTab("signin");
      setError(null);
      setIsLoading(false);
      setSiEmail(""); setSiPassword("");
      setSuName(""); setSuEmail(""); setSuPassword("");
      setShowPassword(false);
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const doLogin = (u: AuthUser) => {
    const ranPendingAction = login(u);
    // If user signed in to generate a course, the pending callback opens the progress modal.
    if (!ranPendingAction) {
      router.push("/dashboard");
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    doLogin({
      name: "Google User",
      email: "user@gmail.com",
      avatarLetter: "G",
      credits: FREE_CREDITS,
      plan: "free",
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === "signup") {
      if (!suName.trim()) { setError("Please enter your name."); return; }
      if (!suEmail.trim()) { setError("Please enter your email."); return; }
      if (suPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 900));
      doLogin({
        name: suName.trim(),
        email: suEmail.trim().toLowerCase(),
        avatarLetter: suName.trim()[0].toUpperCase(),
        credits: FREE_CREDITS,
        plan: "free",
      });
    } else {
      if (!siEmail.trim()) { setError("Please enter your email."); return; }
      if (!siPassword) { setError("Please enter your password."); return; }
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 900));
      const name = siEmail.split("@")[0];
      doLogin({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: siEmail.trim().toLowerCase(),
        avatarLetter: name[0].toUpperCase(),
        credits: FREE_CREDITS,
        plan: "free",
      });
    }
    setIsLoading(false);
  };

  const email = tab === "signin" ? siEmail : suEmail;
  const password = tab === "signin" ? siPassword : suPassword;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeAuthModal}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={tab === "signin" ? "Sign in to SkillProof" : "Create your account"}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.25)] ring-1 ring-black/8">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          {/* Accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

          <div className="px-8 pb-8 pt-7">
            {/* Header */}
            <div className="mb-5 flex flex-col items-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                <GraduationCap className="size-6" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {tab === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tab === "signin"
                    ? "Sign in to access your courses and credits"
                    : "Start free — get 3 course credits instantly"}
                </p>
              </div>
            </div>

            {/* Free credits badge — only on signup */}
            {tab === "signup" && (
              <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5">
                <Sparkles className="size-4 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-700">
                  Free plan includes 3 course credits — no card needed
                </span>
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/30 hover:shadow-md disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">or continue with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Tab switcher */}
            <div className="mb-4 flex rounded-xl bg-muted/50 p-1">
              <TabButton active={tab === "signin"} onClick={() => { setTab("signin"); setError(null); }}>
                Sign in
              </TabButton>
              <TabButton active={tab === "signup"} onClick={() => { setTab("signup"); setError(null); }}>
                Create account
              </TabButton>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailSubmit} noValidate className="space-y-3">
              {tab === "signup" && (
                <AuthInput
                  ref={firstInputRef}
                  label="Full name"
                  type="text"
                  placeholder="Your name"
                  value={suName}
                  onChange={setSuName}
                  autoComplete="name"
                  disabled={isLoading}
                />
              )}

              <AuthInput
                ref={tab === "signin" ? firstInputRef : undefined}
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={tab === "signin" ? setSiEmail : setSuEmail}
                autoComplete={tab === "signin" ? "email" : "new-email"}
                disabled={isLoading}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={tab === "signup" ? "At least 6 characters" : "Your password"}
                    value={password}
                    onChange={(e) =>
                      tab === "signin" ? setSiPassword(e.target.value) : setSuPassword(e.target.value)
                    }
                    autoComplete={tab === "signin" ? "current-password" : "new-password"}
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl border border-input bg-background pr-11 pl-4 text-sm transition-all outline-none placeholder:text-muted-foreground/60 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/15 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "btn-gradient mt-1 h-11 w-full rounded-xl border-0 text-sm font-semibold",
                  isLoading && "opacity-70",
                )}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : tab === "signin" ? (
                  "Sign in"
                ) : (
                  "Create account — it's free"
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">Terms</a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function TabButton({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-semibold transition-all",
        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function AuthInput({
  label, type, placeholder, value, onChange, autoComplete, disabled, ref,
}: {
  label: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; disabled?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm transition-all outline-none placeholder:text-muted-foreground/60 focus-visible:border-primary/50 focus-visible:ring-3 focus-visible:ring-primary/15 disabled:opacity-60"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}
