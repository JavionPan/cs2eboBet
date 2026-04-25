import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { placeBet } from "@/lib/services/prediction-service";
import { betInputSchema } from "@/lib/validators/prediction";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = betInputSchema.safeParse({
      ...body,
      amount: Number(body.amount),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 },
      );
    }

    const result = await placeBet(
      user.id,
      parsed.data.predictionId,
      parsed.data.optionId,
      parsed.data.amount,
    );

    return NextResponse.json({ success: true, betId: result.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "下注失败" },
      { status: 400 },
    );
  }
}
