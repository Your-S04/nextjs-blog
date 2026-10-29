import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="-skew-x-2 border-2 border-foreground bg-surface p-1 shadow-[5px_5px_0_0_var(--shadow)]">
        <div className="skew-x-2">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
