import { UserRole } from "@prisma/client";
import { AdminPredictionForm } from "@/components/admin-prediction-form";
import { requireRole } from "@/lib/server/auth";

export default async function NewPredictionPage() {
  await requireRole([UserRole.admin, UserRole.publisher]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-white">创建预测题</h1>
      </div>
      <AdminPredictionForm mode="create" />
    </div>
  );
}
