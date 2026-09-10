"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (isTokenValid(token)) {
      setIsVerified(true);
    } else {
      localStorage.removeItem("access_token");
      setIsVerified(false);
      router.push("/verify-password");
    }
  }, [router]);

  if (isVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-muted-foreground/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Đang kiểm tra xác minh...</p>
        </div>
      </div>
    );
  }

  if (isVerified === false) {
    return null;
  }

  return <>{children}</>;
}
