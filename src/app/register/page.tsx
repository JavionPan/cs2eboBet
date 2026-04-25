import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="register" />
      <p className="text-center text-sm text-muted">
        已有账号？ <Link href="/login" className="text-accent">去登录</Link>
      </p>
    </div>
  );
}
