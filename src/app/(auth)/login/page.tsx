"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

// 登入頁：Supabase Auth（Google OAuth + Email/Password）
type Status = "idle" | "loading" | "error";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "登入失敗，請稍後再試"
      );
      setStatus("error");
    }
  };

  const handleGoogleLogin = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      await signInWithGoogle();
      // 會導向 Google 登入，成功後由 /api/auth/callback 導回
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Google 登入失敗，請稍後再試"
      );
      setStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          Mystic AI Tarot
        </p>
        <h1 className="mb-8 text-center text-2xl font-semibold text-white">
          登入
        </h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={status === "loading"}
          className="mb-4 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center text-sm font-medium text-white disabled:opacity-50"
        >
          使用 Google 登入
        </button>

        <div className="mb-4 flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30">或使用 Email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form
          onSubmit={handleEmailLogin}
          className="flex w-full flex-col gap-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:border-primary/40 focus:outline-none"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼"
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:border-primary/40 focus:outline-none"
          />

          {status === "error" && (
            <p className="text-center text-sm text-red-400">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-2xl border border-primary/30 bg-primary px-6 py-4 text-center text-base font-semibold text-white disabled:opacity-50"
          >
            {status === "loading" ? "登入中…" : "登入"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/40">
          還沒有帳號？{" "}
          <Link href="/register" className="text-primary-light">
            前往註冊
          </Link>
        </p>
      </div>
    </main>
  );
}
