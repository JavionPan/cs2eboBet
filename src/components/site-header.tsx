import Link from "next/link";
import { getCurrentUser } from "@/lib/server/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-panel/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-wide text-white">
          CS2 Fun Predict
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-300">
          <Link href="/">首页</Link>
          {user && <Link href="/profile">我的</Link>}
          {user && (user.role === "admin" || user.role === "publisher") && (
            <Link href="/admin">后台</Link>
          )}
          {user ? (
            <>
              <span className="rounded-full border border-line px-3 py-1 text-accent">
                {user.username} · {user.balance} 代币
              </span>
              <form action="/api/auth/logout" method="post">
                <button className="rounded-lg border border-line px-3 py-2 hover:border-accent">
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">登录</Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent px-3 py-2 font-semibold text-black"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
