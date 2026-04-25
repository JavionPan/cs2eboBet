"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateRecommendedOdds } from "@/lib/odds";

type FormPrediction = {
  id?: string;
  title: string;
  matchName: string;
  playerName?: string | null;
  description: string;
  closeAt: string;
  options: { label: string; odds: number; probability?: number }[];
};

type Props = {
  mode: "create" | "edit";
  prediction?: FormPrediction;
};

export function AdminPredictionForm({ mode, prediction }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(prediction?.title ?? "");
  const [matchName, setMatchName] = useState(prediction?.matchName ?? "");
  const [playerName, setPlayerName] = useState(prediction?.playerName ?? "");
  const [description, setDescription] = useState(prediction?.description ?? "");
  const [closeAt, setCloseAt] = useState(prediction?.closeAt ?? "");
  const [options, setOptions] = useState(
    prediction?.options ?? [
      { label: "选项 A", odds: 1.8, probability: 50 },
      { label: "选项 B", odds: 1.9, probability: 50 },
    ],
  );
  const [holdPercent, setHoldPercent] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(() => {
    if (mode === "create") {
      return "/api/admin/predictions";
    }
    return `/api/admin/predictions/${prediction?.id}`;
  }, [mode, prediction?.id]);

  const method = mode === "create" ? "POST" : "PATCH";

  const recommendedOdds = useMemo(
    () =>
      calculateRecommendedOdds(
        options.map((option) => ({
          label: option.label,
          probability: option.probability ?? 0,
        })),
        holdPercent,
      ),
    [holdPercent, options],
  );

  const updateOption = (
    index: number,
    field: "label" | "odds" | "probability",
    value: string,
  ) => {
    setOptions((current) =>
      current.map((option, currentIndex) =>
        currentIndex === index
          ? {
              ...option,
              [field]:
                field === "label"
                  ? value
                  : Number.isFinite(Number(value))
                    ? Number(value)
                    : 0,
            }
          : option,
      ),
    );
  };

  const applyRecommendedOdds = () => {
    setOptions((current) =>
      current.map((option, index) => ({
        ...option,
        odds: recommendedOdds[index]?.offeredOdds || option.odds,
      })),
    );
  };

  const onSubmit = async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        matchName,
        playerName,
        description,
        closeAt,
        options,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(result.error ?? "提交失败");
      return;
    }

    router.push(mode === "create" ? "/admin" : `/admin/predictions/${prediction?.id}`);
    router.refresh();
  };

  return (
    <div className="rounded-3xl border border-line bg-panelSoft p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">标题</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">比赛名称</span>
          <input
            value={matchName}
            onChange={(event) => setMatchName(event.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">选手名（可空）</span>
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">截止时间</span>
          <input
            type="datetime-local"
            value={closeAt}
            onChange={(event) => setCloseAt(event.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm text-slate-200">描述</span>
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
        />
      </label>

      <div className="mt-6 rounded-2xl border border-line bg-bg/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">真实赔率辅助</p>
            <p className="mt-1 text-sm text-muted">
              先填你对各选项的主观概率，系统会自动归一化后给出公平赔率和低抽水赔率。
            </p>
          </div>
          <label className="block min-w-[180px]">
            <span className="mb-2 block text-sm text-slate-200">平台抽水 %</span>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={holdPercent}
              onChange={(event) => setHoldPercent(Number(event.target.value))}
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setHoldPercent(0)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-white"
          >
            设为 0% 抽水
          </button>
          <button
            type="button"
            onClick={() => setHoldPercent(1)}
            className="rounded-xl border border-line px-4 py-2 text-sm text-white"
          >
            设为 1% 抽水
          </button>
          <button
            type="button"
            onClick={applyRecommendedOdds}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black"
          >
            应用推荐赔率
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {options.map((option, index) => (
          <div key={index} className="rounded-2xl border border-line bg-bg/70 p-4">
            <p className="text-sm font-semibold text-white">选项 {index + 1}</p>
            <input
              value={option.label}
              onChange={(event) => updateOption(index, "label", event.target.value)}
              className="mt-3 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
            />
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={option.probability ?? 0}
              onChange={(event) => updateOption(index, "probability", event.target.value)}
              className="mt-3 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
              placeholder="主观概率，比如 55"
            />
            <input
              type="number"
              step="0.01"
              min="1.01"
              value={option.odds}
              onChange={(event) => updateOption(index, "odds", event.target.value)}
              className="mt-3 w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
            />
            <div className="mt-3 rounded-xl border border-line/70 bg-panel/60 px-4 py-3 text-sm text-slate-300">
              <p>归一化概率: {recommendedOdds[index]?.normalizedProbability ?? 0}%</p>
              <p className="mt-1">公平赔率: {recommendedOdds[index]?.fairOdds.toFixed(2) ?? "0.00"}</p>
              <p className="mt-1 text-accent">
                推荐赔率: {recommendedOdds[index]?.offeredOdds.toFixed(2) ?? "0.00"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-bad">{message}</p>}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="mt-6 rounded-xl bg-accent px-5 py-3 font-semibold text-black disabled:opacity-60"
      >
        {loading ? "提交中..." : mode === "create" ? "创建题目" : "保存修改"}
      </button>
    </div>
  );
}
