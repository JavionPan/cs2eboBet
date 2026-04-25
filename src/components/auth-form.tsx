"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "register"
        ? {
            email: String(formData.get("email") ?? ""),
            username: String(formData.get("username") ?? ""),
            password: String(formData.get("password") ?? ""),
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "提交失败");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded-3xl border border-line bg-panelSoft p-6 shadow-esports"
    >
      <h1 className="text-3xl font-semibold text-white">
        {mode === "login" ? "登录账号" : "创建账号"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        新用户注册即获得 20 虚拟代币，每日登录可再领取 20 代币。
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">邮箱</span>
          <input
            name="email"
            type="email"
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
            placeholder="you@example.com"
            required
          />
        </label>

        {mode === "register" && (
          <label className="block">
            <span className="mb-2 block text-sm text-slate-200">用户名</span>
            <input
              name="username"
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
              placeholder="cs2_fan"
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">密码</span>
          <input
            name="password"
            type="password"
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
            placeholder="至少 6 位"
            required
          />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-bad">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-black disabled:opacity-60"
      >
        {loading ? "提交中..." : mode === "login" ? "登录" : "注册"}
      </button>
    </form>
  );
}
