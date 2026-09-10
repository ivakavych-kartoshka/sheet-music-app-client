"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Key, User, Disc3, ArrowRight, ArrowLeft } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function VerifyPasswordContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = `${API_URL}/auth/google`;
  };

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed" || error === "login_failed") {
      toast({
        title: "Lỗi",
        description: "Đăng nhập Google thất bại, vui lòng thử lại.",
        variant: "destructive",
      });
      router.replace("/verify-password");
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Lỗi",
          description: data.message || "Email hoặc mật khẩu không đúng!",
          variant: "destructive",
        });
        setPassword("");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      if (data.user) {
        localStorage.setItem("user_info", JSON.stringify(data.user));
      }

      toast({
        title: "Thành công",
        description: "Đăng nhập thành công, chuyển trang...",
      });

      const isAdmin = data.user?.role === "admin";
      setTimeout(() => {
        router.push(isAdmin ? "/dashboard" : "/");
      }, 1000);
    } catch {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px] animate-float" />
        <div className="absolute -right-24 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-chart-2/5 blur-[100px]" />
        <div className="absolute left-1/3 -bottom-20 h-[18rem] w-[26rem] rounded-full bg-chart-3/4 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 group">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Về trang chủ
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
              <Disc3 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Thư Viện FTC</span>
          </div>
        </div>

        <Card className="shadow-xl shadow-primary/5 border-border/30 bg-card/60 glass card-glow overflow-hidden animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                Đăng Nhập
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Đăng nhập bằng email để truy cập thư viện
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 pr-4 rounded-xl bg-background/60 border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200">
                    <Key className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-11 rounded-xl bg-background/60 border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-primary-glow"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Đăng nhập</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px divider-glow" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground tracking-wider">
                  Hoặc
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full h-11 gap-3 rounded-xl border-border/40 bg-background/60 font-semibold hover:bg-background/80 hover:border-border/60 transition-all duration-200 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  <span>Đang chuyển đến Google...</span>
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Đăng nhập với Google</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Thư Viện FTC
        </p>
      </div>
    </div>
  );
}

export default function VerifyPasswordPage() {
  return (
    <Suspense>
      <VerifyPasswordContent />
    </Suspense>
  );
}
