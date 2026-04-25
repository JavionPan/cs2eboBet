import { DailyRewardButton } from "@/components/daily-reward-button";
import { requireUser } from "@/lib/server/auth";
import { getProfileData } from "@/lib/server/data";
import { formatDateTime } from "@/lib/utils";

export default async function ProfilePage() {
  const currentUser = await requireUser();
  const user = await getProfileData(currentUser.id);

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-line bg-panelSoft p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Profile</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{user.username}</h1>
          <p className="mt-2 text-slate-300">{user.email}</p>
          <div className="mt-6 rounded-2xl border border-line bg-bg/70 p-4">
            <p className="text-sm text-muted">当前余额</p>
            <p className="mt-2 text-4xl font-bold text-accent">{user.balance}</p>
          </div>
        </div>
        <DailyRewardButton />
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-line bg-panelSoft p-6">
          <h2 className="text-xl font-semibold text-white">我的下注记录</h2>
          <div className="mt-4 space-y-3">
            {user.bets.map((bet) => (
              <div key={bet.id} className="rounded-2xl border border-line bg-bg/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{bet.prediction.title}</p>
                    <p className="text-sm text-slate-300">
                      选择 {bet.option.label} · 下注 {bet.amount} · 状态 {bet.status}
                    </p>
                  </div>
                  <div className="text-sm text-muted">{formatDateTime(bet.createdAt)}</div>
                </div>
              </div>
            ))}
            {user.bets.length === 0 && <p className="text-sm text-muted">还没有下注记录。</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-panelSoft p-6">
          <h2 className="text-xl font-semibold text-white">最近代币流水</h2>
          <div className="mt-4 space-y-3">
            {user.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between rounded-2xl border border-line bg-bg/70 px-4 py-3">
                <div>
                  <p className="text-white">{transaction.description}</p>
                  <p className="text-xs text-muted">{formatDateTime(transaction.createdAt)}</p>
                </div>
                <span className={transaction.amount >= 0 ? "text-good" : "text-bad"}>
                  {transaction.amount >= 0 ? "+" : ""}
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
