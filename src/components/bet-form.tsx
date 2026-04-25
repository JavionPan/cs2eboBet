"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BetFormProps = {
  predictionId: string;
  options: { id: string; label: string; odds: number }[];
  disabled?: boolean;
};

export function BetForm({ predictionId, options, disabled }: BetFormProps) {
  const router = useRouter();
  const [optionId, setOptionId] = useState(options[0]?.id ?? "");
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch(`/api/predictions/${predictionId}/bet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictionId, optionId, amount }),
    });
    const result = await response.json();

    setLoading(false);
    setMessage(result.error ?? "下注成功");

    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-panelSoft p-5">
      <h3 className="text-lg font-semibold text-white">参与预测</h3>
      <div className="mt-4 space-y-4">
        <div className="grid gap-3">
          {options.map((option) => (
            <label
              key={option.id}
              className={`cursor-pointer rounded-xl border px-4 py-3 ${
                optionId === option.id ? "border-accent bg-accent/10" : "border-line bg-bg"
              }`}
            >
              <input
                type="radio"
                name="option"
                value={option.id}
                checked={optionId === option.id}
                onChange={() => setOptionId(option.id)}
                className="hidden"
                disabled={disabled}
              />
              <div className="flex items-center justify-between">
                <span className="text-white">{option.label}</span>
                <span className="text-accent">赔率 {option.odds.toFixed(2)}</span>
              </div>
            </label>
          ))}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-200">下注代币</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-white outline-none focus:border-accent"
            disabled={disabled}
          />
        </label>

        <button
          onClick={onSubmit}
          disabled={loading || disabled}
          className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "提交中..." : disabled ? "当前不可下注" : "确认下注"}
        </button>

        {message && <p className="text-sm text-slate-300">{message}</p>}
      </div>
    </div>
  );
}
