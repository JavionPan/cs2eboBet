import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { assertRole } from "@/lib/server/auth";
import { createPrediction } from "@/lib/services/admin-service";

export async function POST(request: Request) {
  try {
    const actor = await assertRole([UserRole.admin, UserRole.publisher]);
    const body = await request.json();
    const prediction = await createPrediction(actor, body);
    return NextResponse.json({ success: true, id: prediction.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建失败";
    return NextResponse.json({ error: message }, { status: message === "FORBIDDEN" ? 403 : 400 });
  }
}
