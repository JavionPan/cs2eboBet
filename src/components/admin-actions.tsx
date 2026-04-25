"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  predictionId: string;
  options: { id: string; label: string }[];
  canEdit: boolean;
};

export function AdminActions({ predictionId, options, canEdit }: Props) {
  const router = useRouter();
  const [correctOptionId, setCorrectOptionId] = useState(options[0]?.id ?? "");
  const [message, setMessage] = useState("");

  async function callApi(path: string, body?: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    setMessage(result.error ?? "操作成功");
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-panelSoft p-5">
      <h3 className="text-lg font-semibold text-white">管理操作</h3>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => callApi(`/api/admin/predictions/${predictionId}/close`)}
          disabled={!canEdit}
          className="rounded-xl border border-line px-4 py-3 text-white disabled:opacity-50"
        >
          手动关闭
        </button>
        <button
          onClick={() => callApi(`/api/admin/predictions/${predictionId}/cancel`)}
          className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-bad"
        >
          取消并退款
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-bg/70 p-4">
        <p className="text-sm text-slate-200">结算题目</p>
        <select
          value={correctOptionId}
          onChange={(event) => setCorrectOptionId(event.target.value)}
          className="mt-3 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            callApi(`/api/admin/predictions/${predictionId}/settle`, { correctOptionId })
          }
          className="mt-3 rounded-xl bg-accent px-4 py-3 font-semibold text-black"
        >
          选择正确答案并结算
        </button>
      </div>

      {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
    </div>
  );
}
