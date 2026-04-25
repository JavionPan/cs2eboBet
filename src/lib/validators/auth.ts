import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  username: z
    .string()
    .min(3, "用户名至少 3 位")
    .max(20, "用户名最多 20 位")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});
