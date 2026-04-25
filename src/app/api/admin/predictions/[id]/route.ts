import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { assertRole } from "@/lib/server/auth";
import { updatePrediction } from "@/lib/services/admin-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await assertRole([UserRole.admin, UserRole.publisher]);
    const body = await request.json();
    const { id } = await params;
    await updatePrediction(id, actor, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json({ error: message }, { status: message === "FORBIDDEN" ? 403 : 400 });
  }
}
