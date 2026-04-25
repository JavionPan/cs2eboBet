import { PredictionStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { predictionInputSchema } from "@/lib/validators/prediction";

type PredictionPayload = {
  title: string;
  matchName: string;
  playerName?: string;
  description: string;
  closeAt: string;
  options: { label: string; odds: number }[];
};

export async function createPrediction(
  actor: { id: string; role: UserRole },
  payload: PredictionPayload,
) {
  if (![UserRole.admin, UserRole.publisher].includes(actor.role)) {
    throw new Error("FORBIDDEN");
  }

  const parsed = predictionInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "参数错误");
  }

  return prisma.prediction.create({
    data: {
      title: parsed.data.title,
      matchName: parsed.data.matchName,
      playerName: parsed.data.playerName || null,
      description: parsed.data.description,
      closeAt: new Date(parsed.data.closeAt),
      createdById: actor.id,
      status: PredictionStatus.open,
      options: {
        create: parsed.data.options.map((option) => ({
          label: option.label,
          odds: option.odds,
        })),
      },
    },
  });
}

export async function updatePrediction(
  predictionId: string,
  actor: { id: string; role: UserRole },
  payload: PredictionPayload,
) {
  const parsed = predictionInputSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "参数错误");
  }

  return prisma.$transaction(async (tx) => {
    const prediction = await tx.prediction.findUnique({
      where: { id: predictionId },
      include: { options: true },
    });

    if (!prediction) {
      throw new Error("题目不存在");
    }
    if (
      prediction.status === PredictionStatus.settled ||
      prediction.status === PredictionStatus.cancelled
    ) {
      throw new Error("只有未结算且未取消的题目可以编辑");
    }
    if (
      actor.role !== UserRole.admin &&
      prediction.createdById !== actor.id
    ) {
      throw new Error("FORBIDDEN");
    }
    const betCount = await tx.bet.count({ where: { predictionId } });
    if (betCount > 0) {
      throw new Error("已有下注记录的题目暂不支持编辑选项，请新建题目");
    }

    await tx.prediction.update({
      where: { id: predictionId },
      data: {
        title: parsed.data.title,
        matchName: parsed.data.matchName,
        playerName: parsed.data.playerName || null,
        description: parsed.data.description,
        closeAt: new Date(parsed.data.closeAt),
      },
    });

    await tx.predictionOption.deleteMany({
      where: { predictionId },
    });

    await tx.predictionOption.createMany({
      data: parsed.data.options.map((option) => ({
        predictionId,
        label: option.label,
        odds: option.odds,
      })),
    });

    return { success: true };
  });
}

export async function closePrediction(
  predictionId: string,
  actor: { id: string; role: UserRole },
) {
  const prediction = await prisma.prediction.findUnique({
    where: { id: predictionId },
  });

  if (!prediction) {
    throw new Error("题目不存在");
  }
  if (prediction.status !== PredictionStatus.open) {
    throw new Error("只有开放中的题目可以关闭");
  }
  if (
    actor.role !== UserRole.admin &&
    prediction.createdById !== actor.id
  ) {
    throw new Error("FORBIDDEN");
  }

  return prisma.prediction.update({
    where: { id: predictionId },
    data: { status: PredictionStatus.closed },
  });
}
