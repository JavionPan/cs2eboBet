import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { claimDailyReward } from "@/lib/services/prediction-service";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const result = await claimDailyReward(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "领取失败" },
      { status: 400 },
    );
  }
}
