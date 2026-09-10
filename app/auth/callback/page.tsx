"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Disc3 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const avatar = searchParams.get("avatar");
    const mustSetPassword = searchParams.get("must_set_password") === "1";
    const error = searchParams.get("error");

    if (!accessToken) {
      router.replace(`/verify-password${error ? `?error=${error}` : "?error=login_failed"}`);
      return;
    }

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem(
      "user_info",
      JSON.stringify({
        name: name || "Người dùng",
        email: email || "",
        avatar: avatar || "",
        role: "user",
      })
    );

    if (mustSetPassword) {
      router.replace("/set-password");
      return;
    }

    router.replace("/");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 border border-primary/15 animate-pulse-glow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Disc3 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse-glow">Đang đăng nhập...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
