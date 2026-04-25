import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { assertRole } from "@/lib/server/auth";
import { settlePrediction } from "@/lib/services/prediction-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await assertRole([UserRole.admin, UserRole.publisher]);
    const { id } = await params;
    const body = await request.json();
    await settlePrediction(id, String(body.correctOptionId ?? ""), actor);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "结算失败";
    return NextResponse.json({ error: message }, { status: message === "FORBIDDEN" ? 403 : 400 });
  }
}
