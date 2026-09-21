import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "login" | "signup";

type AuthShellProps = {
  mode: AuthMode;
  registered?: boolean;
};

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "The email or password is incorrect.";
  if (normalized.includes("user already registered")) return "An account with this email already exists.";
  if (normalized.includes("email not confirmed")) return "Please confirm your email before logging in.";
  if (normalized.includes("password should be at least")) return "Your password does not meet the minimum length.";
  return "Something went wrong. Please try again.";
}

function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  showPassword,
  onTogglePassword,
}: {
  id: string;
  label: string;
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  const isPassword = type === "password";
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {isPassword ? (
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        ) : (
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          id={id}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={isPassword ? "pl-10 pr-11" : "pl-10"}
          required
        />
        {isPassword && onTogglePassword ? (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AuthShell({ mode, registered = false }: AuthShellProps) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) void navigate({ to: "/hello", replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = isSignup
      ? await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        })
      : await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (result.error) {
      setError(getAuthErrorMessage(result.error.message));
      setIsSubmitting(false);
      return;
    }

    if (isSignup) {
      if (result.data.session) await supabase.auth.signOut();
      await navigate({ to: "/login", search: { registered: true }, replace: true });
    } else {
      await navigate({ to: "/hello", replace: true });
    }
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-2xl border bg-background shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
          <div className="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-wide">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
              <ShieldCheck className="size-5" />
            </span>
            Secure access
          </div>
          <div className="relative z-10 max-w-sm">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
              Simple. Secure. Ready.
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">Your work, protected.</h1>
            <p className="mt-5 text-base leading-7 text-primary-foreground/70">
              Sign in to continue to your private workspace with a session managed by your authentication provider.
            </p>
          </div>
          <p className="relative z-10 text-xs text-primary-foreground/50">Authentication demo · 2026</p>
          <div className="absolute -bottom-28 -right-24 size-80 rounded-full border border-primary-foreground/10" />
          <div className="absolute -bottom-12 -right-8 size-48 rounded-full border border-primary-foreground/10" />
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="px-0 pb-7">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary lg:hidden">
                <ShieldCheck className="size-6" />
              </div>
              <CardTitle className="text-3xl tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {isSignup ? "Use your email to get started." : "Enter your details to continue."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {registered ? (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>Account created. Check your email to confirm your account, then log in.</p>
                </div>
              ) : null}
              {error ? (
                <div role="alert" className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                  id="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <AuthField
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((current) => !current)}
                />
                {isSignup ? (
                  <AuthField
                    id="confirm-password"
                    label="Confirm password"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword((current) => !current)}
                  />
                ) : null}
                <Button className="h-11 w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
                  {!isSubmitting ? <ArrowRight className="size-4" /> : null}
                </Button>
              </form>
              <p className="mt-7 text-center text-sm text-muted-foreground">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                <Link className="font-medium text-primary underline-offset-4 hover:underline" to={isSignup ? "/login" : "/signup"}>
                  {isSignup ? "Log in" : "Sign up"}
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}