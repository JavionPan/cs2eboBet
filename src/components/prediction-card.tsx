import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

type PredictionCardProps = {
  prediction: {
    id: string;
    title: string;
    matchName: string;
    playerName: string | null;
    closeAt: Date;
    options: { id: string; label: string; odds: number }[];
    bets: { id: string }[];
  };
};

export function PredictionCard({ prediction }: PredictionCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-panel/70 p-5 shadow-esports">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent/90">Prediction</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{prediction.title}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {prediction.matchName}
            {prediction.playerName ? ` · ${prediction.playerName}` : ""}
          </p>
        </div>
        <span className="rounded-full border border-line bg-bg/40 px-3 py-1 text-xs text-slate-300">
          {prediction.bets.length} 人参与
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {prediction.options.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-line/80 bg-bg/45 px-3 py-3 text-sm text-slate-200"
          >
            <div className="font-medium">{option.label}</div>
            <div className="mt-1 text-accent">赔率 {option.odds.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>截止 {formatDateTime(prediction.closeAt)}</span>
        <Link href={`/predictions/${prediction.id}`} className="font-semibold text-white hover:text-accent">
          查看详情
        </Link>
      </div>
    </div>
  );
}
