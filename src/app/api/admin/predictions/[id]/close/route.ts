import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { assertRole } from "@/lib/server/auth";
import { closePrediction } from "@/lib/services/admin-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await assertRole([UserRole.admin, UserRole.publisher]);
    const { id } = await params;
    await closePrediction(id, actor);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "关闭失败";
    return NextResponse.json({ error: message }, { status: message === "FORBIDDEN" ? 403 : 400 });
  }
}
