import { PredictionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/utils";

export async function getHomePageData() {
  const [openPredictions, balances, todayTransactions] = await Promise.all([
    prisma.prediction.findMany({
      where: {
        status: PredictionStatus.open,
        closeAt: { gt: new Date() },
      },
      include: {
        options: true,
        bets: true,
        createdBy: {
          select: { username: true },
        },
      },
      orderBy: { closeAt: "asc" },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: [{ balance: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        username: true,
        balance: true,
      },
    }),
    prisma.tokenTransaction.findMany({
      where: {
        createdAt: { gte: startOfToday() },
      },
      select: {
        userId: true,
        amount: true,
        user: {
          select: { username: true },
        },
      },
    }),
  ]);

  const todayMap = new Map<
    string,
    { userId: string; username: string; profit: number }
  >();

  for (const tx of todayTransactions) {
    const current = todayMap.get(tx.userId) ?? {
      userId: tx.userId,
      username: tx.user.username,
      profit: 0,
    };
    current.profit += tx.amount;
    todayMap.set(tx.userId, current);
  }

  const today = Array.from(todayMap.values()).sort((a, b) => b.profit - a.profit);

  return {
    openPredictions,
    balanceLeaderboard: balances,
    profitLeaderboard: today.filter((item) => item.profit > 0).slice(0, 10),
    lossLeaderboard: [...today]
      .filter((item) => item.profit < 0)
      .sort((a, b) => a.profit - b.profit)
      .slice(0, 10),
  };
}

export async function getPredictionPageData(id: string) {
  const prediction = await prisma.prediction.findUnique({
    where: { id },
    include: {
      options: {
        orderBy: { createdAt: "asc" },
      },
      bets: {
        include: {
          user: {
            select: { id: true, username: true },
          },
          option: true,
        },
      },
      createdBy: {
        select: { username: true, role: true },
      },
      correctOption: true,
    },
  });

  if (!prediction) {
    return null;
  }

  const optionStats = prediction.options.map((option) => {
    const optionBets = prediction.bets.filter((bet) => bet.optionId === option.id);
    return {
      optionId: option.id,
      label: option.label,
      odds: option.odds,
      betCount: optionBets.length,
      totalAmount: optionBets.reduce((sum, bet) => sum + bet.amount, 0),
    };
  });

  const userNet = prediction.bets.map((bet) => {
    const option = prediction.options.find((item) => item.id === bet.optionId);
    let net = -bet.amount;

    if (prediction.status === "cancelled") {
      net = 0;
    } else if (prediction.status === "settled" && prediction.correctOptionId === bet.optionId) {
      net = Math.round(bet.amount * (option?.odds ?? 0)) - bet.amount;
    }

    return {
      username: bet.user.username,
      net,
    };
  });

  const bestProfit = [...userNet].sort((a, b) => b.net - a.net)[0] ?? null;
  const biggestLoss = [...userNet].sort((a, b) => a.net - b.net)[0] ?? null;

  return {
    prediction,
    optionStats,
    bestProfit,
    biggestLoss,
    totalBettors: prediction.bets.length,
  };
}

export async function getProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bets: {
        include: {
          prediction: true,
          option: true,
        },
        orderBy: { createdAt: "desc" },
      },
      dailyRewards: {
        orderBy: { createdAt: "desc" },
        take: 7,
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  return user;
}

export async function getAdminDashboard(userId: string, role: string) {
  const where = role === "admin" ? {} : { createdById: userId };

  return prisma.prediction.findMany({
    where,
    include: {
      options: true,
      bets: true,
      createdBy: {
        select: { username: true },
      },
    },
    orderBy: [{ status: "asc" }, { closeAt: "asc" }],
  });
}
