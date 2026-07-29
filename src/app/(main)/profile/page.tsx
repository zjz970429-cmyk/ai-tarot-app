"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

// 個人資料頁（Step 16）
// 使用者資訊（頭像／Email／建立日期）＋ 統計資訊（總占卜次數／今日占卜次數／收藏數／AI 對話次數）
// ＋ 快捷功能（我的歷史／今日塔羅／登出）。資料來自 Supabase，未登入時顯示登入提示。
interface Stats {
  totalReadings: number;
  todayReadings: number;
  favoritesCount: number;
  chatCount: number;
}

type StatsStatus = "loading" | "success" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsStatus, setStatsStatus] = useState<StatsStatus>("loading");

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function fetchStats() {
      try {
        const supabase = createClient();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [
          { count: totalReadings },
          { count: todayReadings },
          { count: favoritesCount },
          { data: readingRows },
        ] = await Promise.all([
          supabase
            .from("readings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase
            .from("readings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id)
            .gte("created_at", startOfToday.toISOString()),
          supabase
            .from("favorites")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase.from("readings").select("id").eq("user_id", user!.id),
        ]);

        const readingIds = (readingRows ?? []).map((r) => r.id);

        let chatCount = 0;
        if (readingIds.length > 0) {
          const { count } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("role", "user")
            .in("reading_id", readingIds);
          chatCount = count ?? 0;
        }

        if (isMounted) {
          setStats({
            totalReadings: totalReadings ?? 0,
            todayReadings: todayReadings ?? 0,
            favoritesCount: favoritesCount ?? 0,
            chatCount,
          });
          setStatsStatus("success");
        }
      } catch (error) {
        console.error("讀取統計資訊失敗：", error);
        if (isMounted) setStatsStatus("error");
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-white/40">載入中…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-white/50">登入後即可查看個人資料與占卜統計。</p>
        <Link
          href="/login"
          className="rounded-2xl border border-primary/30 bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          前往登入
        </Link>
      </main>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-6 py-16 sm:px-10">
      <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
          我的資料
        </p>
        <h1 className="mb-8 text-center text-2xl font-semibold text-white sm:text-3xl">
          個人資料
        </h1>

        {/* 使用者資訊 */}
        <div className="mb-8 flex w-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={user.email ?? "使用者頭像"}
              className="h-16 w-16 rounded-full border border-gold/30 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-white/5">
              <span className="text-xl font-semibold text-gold">{initial}</span>
            </div>
          )}
          <p className="text-base font-medium text-white">{user.email}</p>
          <p className="text-xs text-white/40">
            建立日期：{formatDate(user.created_at)}
          </p>
        </div>

        {/* 統計資訊 */}
        <div className="mb-8 grid w-full grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-gold">
              {statsStatus === "loading" ? "…" : stats?.totalReadings ?? 0}
            </p>
            <p className="mt-1 text-xs text-white/50">總占卜次數</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-gold">
              {statsStatus === "loading" ? "…" : stats?.todayReadings ?? 0}
            </p>
            <p className="mt-1 text-xs text-white/50">今日占卜次數</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-gold">
              {statsStatus === "loading" ? "…" : stats?.favoritesCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-white/50">收藏數</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-gold">
              {statsStatus === "loading" ? "…" : stats?.chatCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-white/50">AI 對話次數</p>
          </div>
        </div>

        {statsStatus === "error" && (
          <p className="mb-6 text-center text-sm text-red-400">
            統計資訊讀取失敗，請稍後再試。
          </p>
        )}

        {/* 快捷功能 */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/history"
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white">我的歷史</p>
            <span className="text-white/30">›</span>
          </Link>

          <Link
            href="/today"
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-medium text-white">今日塔羅</p>
            <span className="text-white/30">›</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left"
          >
            <p className="text-sm font-medium text-white/70">登出</p>
            <span className="text-white/30">›</span>
          </button>
        </div>
      </div>
    </main>
  );
}
