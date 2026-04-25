"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DailyRewardButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onClaim = async () => {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/rewards/daily", {
      method: "POST",
    });
    const result = await response.json();
    setLoading(false);
    setMessage(result.error ?? `已领取 ${result.amount} 代币`);
    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-panelSoft p-4">
      <button
        onClick={onClaim}
        disabled={loading}
        className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-black disabled:opacity-60"
      >
        {loading ? "领取中..." : "领取今日 20 代币"}
      </button>
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </div>
  );
}
