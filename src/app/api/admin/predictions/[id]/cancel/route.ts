import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { assertRole } from "@/lib/server/auth";
import { cancelPrediction } from "@/lib/services/prediction-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await assertRole([UserRole.admin, UserRole.publisher]);
    const { id } = await params;
    await cancelPrediction(id, actor);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "取消失败";
    return NextResponse.json({ error: message }, { status: message === "FORBIDDEN" ? 403 : 400 });
  }
}
