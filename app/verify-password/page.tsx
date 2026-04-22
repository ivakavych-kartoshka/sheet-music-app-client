"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Shield, Key } from "lucide-react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function VerifyPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kiêm tra password
      if (password === ADMIN_PASSWORD) {
        // Lãu session verification
        sessionStorage.setItem("verified", "true");

        toast({
          title: "Thành công",
          description: "Xác minh thành công, chuyển trang...",
        });

        // Chuyên hýng sau 1s
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        toast({
          title: "Lỗi",
          description: "Mật khẩu không chính xác!",
          variant: "destructive",
        });
        setPassword("");
      }
    } catch (error) {
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
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>

      {/* Main card */}
      <Card className="w-full max-w-md shadow-xl border-border/60 bg-card relative z-10">
        <CardHeader className="text-center pb-6">
          {/* Logo/Icon */}
          <div className="mx-auto w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6 border border-border/60">
            <Shield className="w-7 h-7 text-foreground" />
          </div>

          <CardTitle className="text-2xl font-bold text-foreground mb-2">
            XÁC MINH TRUY CẬP
          </CardTitle>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Nhập Mật Khẩu Để Vào Trang Quản Lý
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password input */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Key className="h-4 w-4" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập Mật Khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all"
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
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

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !password}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Đang kiểm tra...</span>
                </div>
              ) : (
                "Xác minh truy cập"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground text-xs z-10">
        <p>© 2024 Th Viên FTC - Hê thông quân lý bài hát</p>
      </div>
    </div>
  );
}
