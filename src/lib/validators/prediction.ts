import { z } from "zod";

export const optionInputSchema = z.object({
  label: z.string().min(1, "选项名称不能为空"),
  odds: z.number().positive("赔率必须大于 0"),
});

export const predictionInputSchema = z.object({
  title: z.string().min(3, "标题至少 3 个字符"),
  matchName: z.string().min(2, "比赛名称至少 2 个字符"),
  playerName: z.string().optional().or(z.literal("")),
  description: z.string().min(5, "描述至少 5 个字符"),
  closeAt: z.string().min(1, "请选择截止时间"),
  options: z.array(optionInputSchema).min(2, "至少需要 2 个选项"),
});

export const betInputSchema = z.object({
  predictionId: z.string().min(1),
  optionId: z.string().min(1),
  amount: z.number().int().positive("下注金额必须大于 0"),
});
