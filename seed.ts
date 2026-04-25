import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, PredictionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      username: "admin",
      passwordHash: adminPassword,
      role: UserRole.admin,
      balance: 200,
    },
    create: {
      email: "admin@example.com",
      username: "admin",
      passwordHash: adminPassword,
      role: UserRole.admin,
      balance: 200,
    },
  });

  const publisherPassword = await bcrypt.hash("publisher123", 10);

  const publisher = await prisma.user.upsert({
    where: { email: "publisher@example.com" },
    update: {
      username: "publisher",
      passwordHash: publisherPassword,
      role: UserRole.publisher,
      balance: 120,
    },
    create: {
      email: "publisher@example.com",
      username: "publisher",
      passwordHash: publisherPassword,
      role: UserRole.publisher,
      balance: 120,
    },
  });

  const exists = await prisma.prediction.count();
  if (exists > 0) {
    return;
  }

  const now = new Date();
  const closeAt = new Date(now.getTime() + 1000 * 60 * 60 * 8);

  await prisma.prediction.create({
    data: {
      title: "今晚 ZywOo 击杀数是否超过 20？",
      matchName: "Vitality vs NAVI",
      playerName: "ZywOo",
      description: "娱乐预测题，看看今晚明星选手能不能火力全开。",
      status: PredictionStatus.open,
      closeAt,
      createdById: publisher.id,
      options: {
        create: [
          { label: "超过 20", odds: 1.85 },
          { label: "不超过 20", odds: 1.95 },
        ],
      },
    },
  });

  await prisma.prediction.create({
    data: {
      title: "本场比赛会打满三图吗？",
      matchName: "FaZe vs Spirit",
      description: "如果双方实力接近，也许会鏖战到决胜图。",
      status: PredictionStatus.open,
      closeAt: new Date(now.getTime() + 1000 * 60 * 60 * 12),
      createdById: admin.id,
      options: {
        create: [
          { label: "会", odds: 2.1 },
          { label: "不会", odds: 1.7 },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
