import Link from "next/link";
import { BetForm } from "@/components/bet-form";
import { getCurrentUser } from "@/lib/server/auth";
import { getPredictionPageData } from "@/lib/server/data";
import { formatDateTime, isPredictionBettable } from "@/lib/utils";

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, user] = await Promise.all([getPredictionPageData(id), getCurrentUser()]);

  if (!data) {
    return <div className="text-muted">题目不存在。</div>;
  }

  const userBet = user
    ? data.prediction.bets.find((bet) => bet.userId === user.id)
    : null;
  const bettable = isPredictionBettable(data.prediction.closeAt, data.prediction.status) && !userBet;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-line bg-panelSoft p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-accent">
                {data.prediction.matchName}
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white">{data.prediction.title}</h1>
              <p className="mt-3 max-w-3xl text-slate-300">{data.prediction.description}</p>
            </div>
            <div className="rounded-2xl border border-line bg-bg/70 px-4 py-3 text-sm">
              <p>状态: {data.prediction.status}</p>
              <p className="mt-2">截止: {formatDateTime(data.prediction.closeAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panelSoft p-5">
            <h2 className="text-lg font-semibold text-white">题目统计</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>总下注人数: {data.totalBettors}</p>
              <p>最大盈利用户: {data.bestProfit ? `${data.bestProfit.username} (${data.bestProfit.net})` : "暂无"}</p>
              <p>最大亏损用户: {data.biggestLoss ? `${data.biggestLoss.username} (${data.biggestLoss.net})` : "暂无"}</p>
              {data.prediction.correctOption && (
                <p>正确答案: {data.prediction.correctOption.label}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panelSoft p-5">
            <h2 className="text-lg font-semibold text-white">选项下注分布</h2>
            <div className="mt-4 space-y-3">
              {data.optionStats.map((option) => (
                <div key={option.optionId} className="rounded-xl border border-line bg-bg/70 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{option.label}</span>
                    <span className="text-accent">赔率 {option.odds.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-slate-300">
                    {option.betCount} 人 · 总下注 {option.totalAmount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panelSoft p-5">
          <h2 className="text-lg font-semibold text-white">下注记录</h2>
          <div className="mt-4 space-y-3">
            {data.prediction.bets.map((bet) => (
              <div key={bet.id} className="flex items-center justify-between rounded-xl border border-line bg-bg/70 px-4 py-3 text-sm">
                <div>
                  <p className="text-white">{bet.user.username}</p>
                  <p className="text-slate-300">
                    选择 {bet.option.label} · 金额 {bet.amount}
                  </p>
                </div>
                <span className="text-muted">{formatDateTime(bet.createdAt)}</span>
              </div>
            ))}
            {data.prediction.bets.length === 0 && <p className="text-sm text-muted">还没有人下注。</p>}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        {!user && (
          <div className="rounded-2xl border border-line bg-panelSoft p-5 text-sm text-slate-300">
            登录后才能参与预测。<Link href="/login" className="text-accent">去登录</Link>
          </div>
        )}
        {userBet && (
          <div className="rounded-2xl border border-line bg-panelSoft p-5 text-sm text-slate-300">
            你已经下注过这道题：{userBet.amount} 代币，选择 {userBet.option.label}。
          </div>
        )}
        {user && (
          <BetForm
            predictionId={data.prediction.id}
            options={data.prediction.options}
            disabled={!bettable}
          />
        )}
      </aside>
    </div>
  );
}
