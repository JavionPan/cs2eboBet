import { PredictionCard } from "@/components/prediction-card";
import { getHomePageData } from "@/lib/server/data";

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[36px] border border-line bg-panel/80 p-6 shadow-esports">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-accent/80">CS2 Community Market</p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">
              更轻、更快、更像真实社区盘口的 CS2 趣味预测站
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              实时浏览开放题目、查看赔率与热度变化，快速进入你关心的比赛和话题。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:min-w-[420px] sm:grid-cols-3">
            <div className="rounded-3xl border border-line bg-bg/50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Open</p>
              <p className="mt-3 text-3xl font-semibold text-white">{data.openPredictions.length}</p>
            </div>
            <div className="rounded-3xl border border-line bg-bg/50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Profit</p>
              <p className="mt-3 text-3xl font-semibold text-white">{data.profitLeaderboard.length}</p>
            </div>
            <div className="rounded-3xl border border-line bg-bg/50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Loss</p>
              <p className="mt-3 text-3xl font-semibold text-white">{data.lossLeaderboard.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">开放中的预测题</h2>
          <span className="text-sm text-muted">{data.openPredictions.length} 个题目</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {data.openPredictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))}
          {data.openPredictions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-panelSoft p-8 text-muted">
              暂时没有开放中的题目。
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[28px] border border-line bg-panel/80 p-5">
          <h3 className="text-lg font-semibold text-white">总代币排行榜</h3>
          <div className="mt-4 space-y-3">
            {data.balanceLeaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-line/70 bg-bg/50 px-4 py-3">
                <span>{index + 1}. {user.username}</span>
                <span className="text-accent">{user.balance}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-panel/80 p-5">
          <h3 className="text-lg font-semibold text-white">今日盈利榜</h3>
          <div className="mt-4 space-y-3">
            {data.profitLeaderboard.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between rounded-2xl border border-line/70 bg-bg/50 px-4 py-3">
                <span>{index + 1}. {user.username}</span>
                <span className="text-good">+{user.profit}</span>
              </div>
            ))}
            {data.profitLeaderboard.length === 0 && <p className="text-sm text-muted">今天还没有盈利记录。</p>}
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-panel/80 p-5">
          <h3 className="text-lg font-semibold text-white">今日亏损榜</h3>
          <div className="mt-4 space-y-3">
            {data.lossLeaderboard.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between rounded-2xl border border-line/70 bg-bg/50 px-4 py-3">
                <span>{index + 1}. {user.username}</span>
                <span className="text-bad">{user.profit}</span>
              </div>
            ))}
            {data.lossLeaderboard.length === 0 && <p className="text-sm text-muted">今天还没有亏损记录。</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
