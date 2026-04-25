import Link from "next/link";
import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/server/auth";
import { getAdminDashboard } from "@/lib/server/data";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await requireRole([UserRole.admin, UserRole.publisher]);
  const predictions = await getAdminDashboard(user.id, user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-white">题目管理后台</h1>
        </div>
        <Link href="/admin/predictions/new" className="rounded-xl bg-accent px-4 py-3 font-semibold text-black">
          创建预测题
        </Link>
      </div>

      <div className="grid gap-4">
        {predictions.map((prediction) => (
          <Link
            key={prediction.id}
            href={`/admin/predictions/${prediction.id}`}
            className="rounded-2xl border border-line bg-panelSoft p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{prediction.title}</h2>
                <p className="mt-2 text-sm text-slate-300">
                  {prediction.matchName} · {prediction.createdBy.username} · {prediction.bets.length} 笔下注
                </p>
              </div>
              <div className="text-sm text-muted">
                <p>状态: {prediction.status}</p>
                <p className="mt-1">截止: {formatDateTime(prediction.closeAt)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
