import {
  BetStatus,
  PredictionStatus,
  TransactionType,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toClaimDayKey } from "@/lib/utils";

export async function placeBet(
  userId: string,
  predictionId: string,
  optionId: string,
  amount: number,
) {
  return prisma.$transaction(async (tx) => {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("下注金额必须大于 0");
    }

    const [user, prediction, existingBet] = await Promise.all([
      tx.user.findUnique({ where: { id: userId } }),
      tx.prediction.findUnique({
        where: { id: predictionId },
        include: { options: true },
      }),
      tx.bet.findUnique({
        where: {
          userId_predictionId: {
            userId,
            predictionId,
          },
        },
      }),
    ]);

    if (!user) {
      throw new Error("用户不存在");
    }
    if (!prediction) {
      throw new Error("题目不存在");
    }
    if (existingBet) {
      throw new Error("同一题目只能下注一次");
    }
    if (prediction.status !== PredictionStatus.open) {
      throw new Error("当前题目不可下注");
    }
    if (prediction.closeAt <= new Date()) {
      throw new Error("题目已截止下注");
    }
    if (!prediction.options.some((option) => option.id === optionId)) {
      throw new Error("下注选项不存在");
    }
    if (user.balance < amount) {
      throw new Error("余额不足");
    }

    const bet = await tx.bet.create({
      data: {
        userId,
        predictionId,
        optionId,
        amount,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        balance: { decrement: amount },
      },
    });

    await tx.tokenTransaction.create({
      data: {
        userId,
        predictionId,
        betId: bet.id,
        type: TransactionType.BET_PLACE,
        amount: -amount,
        description: `下注题目 ${prediction.title}`,
      },
    });

    return bet;
  });
}

export async function settlePrediction(
  predictionId: string,
  correctOptionId: string,
  actor: { id: string; role: UserRole },
) {
  return prisma.$transaction(async (tx) => {
    const prediction = await tx.prediction.findUnique({
      where: { id: predictionId },
      include: {
        options: true,
        bets: true,
      },
    });

    if (!prediction) {
      throw new Error("题目不存在");
    }
    if (prediction.status === PredictionStatus.cancelled) {
      throw new Error("已取消题目不能结算");
    }
    if (prediction.status === PredictionStatus.settled) {
      throw new Error("题目已结算");
    }
    if (
      actor.role !== UserRole.admin &&
      prediction.createdById !== actor.id
    ) {
      throw new Error("FORBIDDEN");
    }

    const correctOption = prediction.options.find((option) => option.id === correctOptionId);
    if (!correctOption) {
      throw new Error("正确答案选项不存在");
    }

    await tx.prediction.update({
      where: { id: predictionId },
      data: {
        status: PredictionStatus.settled,
        correctOptionId,
        settledAt: new Date(),
      },
    });

    for (const bet of prediction.bets) {
      const isWinner = bet.optionId === correctOptionId;
      const payout = isWinner ? Math.round(bet.amount * correctOption.odds) : 0;

      await tx.bet.update({
        where: { id: bet.id },
        data: {
          status: isWinner ? BetStatus.won : BetStatus.lost,
          payout,
        },
      });

      if (isWinner && payout > 0) {
        await tx.user.update({
          where: { id: bet.userId },
          data: {
            balance: { increment: payout },
          },
        });

        await tx.tokenTransaction.create({
          data: {
            userId: bet.userId,
            predictionId,
            betId: bet.id,
            type: TransactionType.BET_WIN,
            amount: payout,
            description: `题目 ${prediction.title} 结算获胜`,
          },
        });
      }
    }

    return { success: true };
  });
}

export async function cancelPrediction(
  predictionId: string,
  actor: { id: string; role: UserRole },
) {
  return prisma.$transaction(async (tx) => {
    const prediction = await tx.prediction.findUnique({
      where: { id: predictionId },
      include: { bets: true },
    });

    if (!prediction) {
      throw new Error("题目不存在");
    }
    if (prediction.status === PredictionStatus.cancelled) {
      throw new Error("题目已取消");
    }
    if (prediction.status === PredictionStatus.settled) {
      throw new Error("已结算题目不能取消");
    }
    if (
      actor.role !== UserRole.admin &&
      prediction.createdById !== actor.id
    ) {
      throw new Error("FORBIDDEN");
    }

    await tx.prediction.update({
      where: { id: predictionId },
      data: {
        status: PredictionStatus.cancelled,
        cancelledAt: new Date(),
      },
    });

    for (const bet of prediction.bets) {
      await tx.bet.update({
        where: { id: bet.id },
        data: {
          status: BetStatus.refunded,
          payout: bet.amount,
        },
      });

      await tx.user.update({
        where: { id: bet.userId },
        data: {
          balance: { increment: bet.amount },
        },
      });

      await tx.tokenTransaction.create({
        data: {
          userId: bet.userId,
          predictionId,
          betId: bet.id,
          type: TransactionType.BET_REFUND,
          amount: bet.amount,
          description: `题目 ${prediction.title} 已取消并退款`,
        },
      });
    }

    return { success: true };
  });
}

export async function claimDailyReward(userId: string) {
  return prisma.$transaction(async (tx) => {
    const todayKey = toClaimDayKey();

    const alreadyClaimed = await tx.dailyReward.findUnique({
      where: {
        userId_claimedDay: {
          userId,
          claimedDay: todayKey,
        },
      },
    });

    if (alreadyClaimed) {
      throw new Error("今天已经领取过奖励");
    }

    await tx.dailyReward.create({
      data: {
        userId,
        claimedDay: todayKey,
        amount: 20,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        balance: { increment: 20 },
      },
    });

    await tx.tokenTransaction.create({
      data: {
        userId,
        type: TransactionType.DAILY_REWARD,
        amount: 20,
        description: "每日登录奖励",
      },
    });

    return { amount: 20 };
  });
}
