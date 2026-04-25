import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <AuthForm mode="login" />
      <p className="text-center text-sm text-muted">
        还没有账号？ <Link href="/register" className="text-accent">立即注册</Link>
      </p>
    </div>
  );
}
