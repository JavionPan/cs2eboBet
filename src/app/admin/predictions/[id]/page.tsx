import Link from "next/link";
import { UserRole } from "@prisma/client";
import { AdminActions } from "@/components/admin-actions";
import { AdminPredictionForm } from "@/components/admin-prediction-form";
import { requireRole } from "@/lib/server/auth";
import { getPredictionPageData } from "@/lib/server/data";
import { formatDateTime } from "@/lib/utils";

export default async function AdminPredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([UserRole.admin, UserRole.publisher]);
  const { id } = await params;
  const data = await getPredictionPageData(id);

  if (!data) {
    return <div className="text-muted">题目不存在。</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{data.prediction.title}</h1>
        </div>
        <Link href="/admin" className="text-sm text-accent">
          返回后台
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-line bg-panelSoft p-6">
            <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-300">
              <p>比赛: {data.prediction.matchName}</p>
              <p>状态: {data.prediction.status}</p>
              <p>截止: {formatDateTime(data.prediction.closeAt)}</p>
              <p>下注人数: {data.totalBettors}</p>
              <p>最大盈利用户: {data.bestProfit ? `${data.bestProfit.username} (${data.bestProfit.net})` : "暂无"}</p>
              <p>最大亏损用户: {data.biggestLoss ? `${data.biggestLoss.username} (${data.biggestLoss.net})` : "暂无"}</p>
            </div>
          </div>

          <AdminPredictionForm
            mode="edit"
            prediction={{
              id: data.prediction.id,
              title: data.prediction.title,
              matchName: data.prediction.matchName,
              playerName: data.prediction.playerName,
              description: data.prediction.description,
              closeAt: new Date(data.prediction.closeAt.getTime() - data.prediction.closeAt.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16),
              options: data.prediction.options.map((option) => {
                const inverseTotal = data.prediction.options.reduce(
                  (sum, current) => sum + 1 / current.odds,
                  0,
                );
                const probability = inverseTotal > 0 ? ((1 / option.odds) / inverseTotal) * 100 : 0;

                return {
                  label: option.label,
                  odds: option.odds,
                  probability: Number(probability.toFixed(2)),
                };
              }),
            }}
          />
        </div>

        <div className="space-y-6">
          <AdminActions
            predictionId={data.prediction.id}
            options={data.prediction.options.map((option) => ({
              id: option.id,
              label: option.label,
            }))}
            canEdit={data.prediction.status !== "settled" && data.prediction.status !== "cancelled"}
          />

          <div className="rounded-2xl border border-line bg-panelSoft p-5">
            <h2 className="text-lg font-semibold text-white">下注记录</h2>
            <div className="mt-4 space-y-3">
              {data.prediction.bets.map((bet) => (
                <div key={bet.id} className="rounded-xl border border-line bg-bg/70 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white">{bet.user.username}</span>
                    <span className="text-muted">{formatDateTime(bet.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-slate-300">
                    {bet.option.label} · 下注 {bet.amount} · 当前状态 {bet.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
