import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/server/auth";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 400 });
    }

    const matched = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!matched) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 400 });
    }

    await createSession(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "登录失败" },
      { status: 500 },
    );
  }
}
