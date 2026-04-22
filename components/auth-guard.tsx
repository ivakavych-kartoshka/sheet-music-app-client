"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = () => {
      const verified = sessionStorage.getItem("verified");
      if (verified === "true") {
        setIsVerified(true);
      } else {
        setIsVerified(false);
        router.push("/verify-password");
      }
    };

    checkVerification();
  }, [router]);

  if (isVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Ðang kiêm tra xác minh...</span>
        </div>
      </div>
    );
  }

  if (isVerified === false) {
    return null; // SÆ chuyên hýng trong useEffect
  }

  return <>{children}</>;
}
