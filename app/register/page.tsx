import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "注册" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm">
      <div className="-skew-x-2 border-2 border-foreground bg-surface p-1 shadow-[5px_5px_0_0_var(--shadow)]">
        <div className="skew-x-2">
          <AuthForm mode="register" />
        </div>
      </div>
    </div>
  );
}
