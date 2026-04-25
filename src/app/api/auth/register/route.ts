import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/server/auth";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "参数错误" },
        { status: 400 },
      );
    }

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
      },
    });

    if (exists) {
      return NextResponse.json({ error: "邮箱或用户名已存在" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        username: parsed.data.username,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        balance: 20,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "注册失败" },
      { status: 500 },
    );
  }
}
