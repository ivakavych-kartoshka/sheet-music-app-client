"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { clearUserSession, isLoggedIn } from "@/app/lib/api";

interface AdminGuardProps {
  children: React.ReactNode;
}

function getTokenRole(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [status, setStatus] = useState<"loading" | "ok" | "forbidden">(
    "loading"
  );
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !isLoggedIn()) {
      clearUserSession();
      router.replace("/verify-password");
      return;
    }

    if (getTokenRole() === "admin") {
      setStatus("ok");
    } else {
      setStatus("forbidden");
    }
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-background text-foreground p-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-[120px] animate-float" />
        </div>

        <Card className="relative z-10 p-8 text-center rounded-3xl border-border/30 bg-card/60 glass card-glow max-w-md animate-scale-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-lg font-semibold mb-2">
            Không có quyền truy cập
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Tài khoản của bạn không được phép đăng nhập vào trang quản trị. Chỉ
            tài khoản quản trị viên mới có quyền truy cập.
          </p>
          <Link href="/" className="inline-block">
            <Button className="gap-2 rounded-xl btn-primary-glow">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
