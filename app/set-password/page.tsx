"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Key, Lock, ArrowRight, Disc3 } from "lucide-react";
import { isLoggedIn, setPassword } from "@/app/lib/api";

export default function SetPasswordPage() {
  const [password, setPasswordValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/verify-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive",
      });
      setPasswordValue("");
      setConfirm("");
      setLoading(false);
      return;
    }

    try {
      await setPassword(password);

      toast({
        title: "Thành công",
        description:
          "Đã đặt mật khẩu. Bạn có thể đăng nhập bằng Google hoặc email/password.",
      });

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể đặt mật khẩu, vui lòng thử lại.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px] animate-float" />
        <div className="absolute -right-24 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-chart-2/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Về trang chủ
        </Link>

        <Card className="shadow-xl shadow-primary/5 border-border/30 bg-card/60 glass card-glow overflow-hidden animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                Đặt Mật Khẩu
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bạn đăng nhập qua Google lần đầu. Đặt mật khẩu để có thể đăng
                nhập bằng email trong lần sau.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ít nhất 6 ký tự"
                    value={password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    className="h-11 pl-10 pr-11 rounded-xl bg-background/60 border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
                    required
                    disabled={loading}
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-foreground"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="h-11 pl-10 pr-4 rounded-xl bg-background/60 border-border/40 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-primary-glow"
                disabled={loading || !password || !confirm}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Lưu mật khẩu</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
